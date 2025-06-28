#!/usr/bin/env node

/**
 * Bundle Optimization and Analysis Script
 * Provides tools to analyze and optimize webpack bundles
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// BUNDLE ANALYSIS
// ============================================================================

class BundleAnalyzer {
  constructor(statsFile = './bundle-stats.json') {
    this.statsFile = statsFile;
    this.stats = this.loadStats();
  }

  loadStats() {
    try {
      if (fs.existsSync(this.statsFile)) {
        return JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load bundle stats:', error.message);
    }
    return null;
  }

  analyzeChunks() {
    if (!this.stats) {
      console.log('No bundle stats available. Run "npm run build:analyze" first.');
      return;
    }

    const chunks = this.stats.chunks || [];
    const analysis = chunks.map(chunk => ({
      id: chunk.id,
      name: chunk.names[0] || `chunk-${chunk.id}`,
      size: chunk.size,
      sizeFormatted: this.formatSize(chunk.size),
      modules: chunk.modules?.length || 0,
      files: chunk.files || [],
    }));

    console.log('\n📊 Bundle Analysis:');
    console.log('==================');
    
    analysis
      .sort((a, b) => b.size - a.size)
      .forEach(chunk => {
        const status = this.getChunkStatus(chunk);
        console.log(`${status} ${chunk.name}: ${chunk.sizeFormatted} (${chunk.modules} modules)`);
      });

    this.generateRecommendations(analysis);
  }

  getChunkStatus(chunk) {
    if (chunk.size > 500 * 1024) return '🔴'; // > 500KB
    if (chunk.size > 250 * 1024) return '🟡'; // > 250KB
    return '🟢'; // <= 250KB
  }

  generateRecommendations(analysis) {
    console.log('\n💡 Optimization Recommendations:');
    console.log('=================================');

    const largeChunks = analysis.filter(chunk => chunk.size > 500 * 1024);
    const manyModulesChunks = analysis.filter(chunk => chunk.modules > 100);
    const totalSize = analysis.reduce((sum, chunk) => sum + chunk.size, 0);

    if (largeChunks.length > 0) {
      console.log('🔍 Large chunks detected:');
      largeChunks.forEach(chunk => {
        console.log(`  - ${chunk.name} (${chunk.sizeFormatted}) - Consider code splitting`);
      });
    }

    if (manyModulesChunks.length > 0) {
      console.log('🔍 Chunks with many modules:');
      manyModulesChunks.forEach(chunk => {
        console.log(`  - ${chunk.name} (${chunk.modules} modules) - Review dependencies`);
      });
    }

    console.log(`\n📈 Total bundle size: ${this.formatSize(totalSize)}`);
    
    if (totalSize > 2 * 1024 * 1024) { // > 2MB
      console.log('⚠️  Bundle size is quite large. Consider:');
      console.log('   - Implementing lazy loading for non-critical features');
      console.log('   - Tree shaking unused imports');
      console.log('   - Using dynamic imports for heavy components');
    }
  }

  findDuplicates() {
    if (!this.stats || !this.stats.modules) {
      console.log('Module information not available in stats.');
      return;
    }

    const moduleMap = new Map();
    
    this.stats.modules.forEach(module => {
      if (!module.name) return;
      
      const normalizedName = this.normalizeModuleName(module.name);
      if (!moduleMap.has(normalizedName)) {
        moduleMap.set(normalizedName, []);
      }
      moduleMap.get(normalizedName).push(module);
    });

    const duplicates = Array.from(moduleMap.entries())
      .filter(([, modules]) => modules.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    if (duplicates.length > 0) {
      console.log('\n🔍 Potential Duplicate Modules:');
      console.log('==============================');
      
      duplicates.slice(0, 10).forEach(([name, modules]) => {
        console.log(`📦 ${name} (${modules.length} instances)`);
        const totalSize = modules.reduce((sum, mod) => sum + (mod.size || 0), 0);
        console.log(`   Total size: ${this.formatSize(totalSize)}`);
      });
    } else {
      console.log('\n✅ No significant duplicate modules found.');
    }
  }

  normalizeModuleName(name) {
    // Remove webpack-specific prefixes and normalize paths
    return name
      .replace(/^\.\//, '')
      .replace(/\?.*$/, '')
      .replace(/^.*node_modules[\/\\]/, '')
      .replace(/^.*src[\/\\]/, '');
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }
}

// ============================================================================
// OPTIMIZATION TASKS
// ============================================================================

class BundleOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
  }

  async optimizeImports() {
    console.log('🔧 Optimizing imports...');
    
    // Find barrel exports that might cause larger bundles
    const srcDir = path.join(this.projectRoot, 'src');
    const indexFiles = this.findFiles(srcDir, 'index.ts', 'index.tsx');
    
    console.log(`Found ${indexFiles.length} index files:`);
    indexFiles.forEach(file => {
      const relativePath = path.relative(this.projectRoot, file);
      console.log(`  - ${relativePath}`);
    });
    
    // Analyze barrel exports
    const analysis = this.analyzeBarrelExports(indexFiles);
    if (analysis.length > 0) {
      console.log('\n💡 Consider direct imports instead of barrel exports for:');
      analysis.forEach(item => {
        console.log(`  - ${item.file} (${item.exports} exports)`);
      });
    }
  }

  analyzeBarrelExports(indexFiles) {
    return indexFiles
      .map(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const exports = (content.match(/export/g) || []).length;
          return {
            file: path.relative(this.projectRoot, file),
            exports,
            content: content.length,
          };
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean)
      .filter(item => item.exports > 5) // Flag files with many exports
      .sort((a, b) => b.exports - a.exports);
  }

  findFiles(dir, ...extensions) {
    const files = [];
    
    function traverse(currentDir) {
      try {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        
        entries.forEach(entry => {
          const fullPath = path.join(currentDir, entry.name);
          
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            traverse(fullPath);
          } else if (entry.isFile() && extensions.includes(entry.name)) {
            files.push(fullPath);
          }
        });
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    traverse(dir);
    return files;
  }

  async treeshakeAnalysis() {
    console.log('🌳 Analyzing tree shaking opportunities...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    
    const problematicDeps = [];
    
    // Check for packages that don't support tree shaking well
    const knownProblems = [
      'lodash', 'moment', 'date-fns', 'rxjs',
      'antd', '@ant-design', 'recharts',
    ];
    
    knownProblems.forEach(dep => {
      if (dependencies[dep]) {
        problematicDeps.push(dep);
      }
    });
    
    if (problematicDeps.length > 0) {
      console.log('\n📦 Dependencies that may need import optimization:');
      problematicDeps.forEach(dep => {
        console.log(`  - ${dep}`);
        this.suggestOptimization(dep);
      });
    } else {
      console.log('✅ No obvious tree shaking issues found.');
    }
  }

  suggestOptimization(dependency) {
    const suggestions = {
      'lodash': 'Use lodash-es or import specific functions: import { debounce } from "lodash/debounce"',
      'moment': 'Consider date-fns or dayjs for better tree shaking',
      'antd': 'Use babel-plugin-import for automatic tree shaking',
      'recharts': 'Import specific components: import { LineChart } from "recharts/LineChart"',
      'rxjs': 'Import specific operators: import { map } from "rxjs/operators"',
    };
    
    if (suggestions[dependency]) {
      console.log(`    💡 ${suggestions[dependency]}`);
    }
  }

  async generateOptimizationReport() {
    const analyzer = new BundleAnalyzer();
    
    console.log('📋 Generating Optimization Report...');
    console.log('====================================\n');
    
    analyzer.analyzeChunks();
    analyzer.findDuplicates();
    
    await this.optimizeImports();
    await this.treeshakeAnalysis();
    
    console.log('\n🚀 Optimization Complete!');
    console.log('Run "npm run build:analyze" to see detailed bundle analysis.');
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const optimizer = new BundleOptimizer();
  const analyzer = new BundleAnalyzer();
  
  switch (command) {
    case 'analyze':
      analyzer.analyzeChunks();
      break;
      
    case 'duplicates':
      analyzer.findDuplicates();
      break;
      
    case 'imports':
      await optimizer.optimizeImports();
      break;
      
    case 'treeshake':
      await optimizer.treeshakeAnalysis();
      break;
      
    case 'report':
      await optimizer.generateOptimizationReport();
      break;
      
    case 'build-analyze':
      console.log('Building with bundle analysis...');
      try {
        execSync('npm run build', { 
          stdio: 'inherit',
          env: { ...process.env, ANALYZE_BUNDLE: 'true' }
        });
        console.log('\n✅ Build complete with analysis.');
        analyzer.analyzeChunks();
      } catch (error) {
        console.error('Build failed:', error.message);
        process.exit(1);
      }
      break;
      
    default:
      console.log('Bundle Optimizer Tool');
      console.log('====================');
      console.log('');
      console.log('Commands:');
      console.log('  analyze        - Analyze existing bundle stats');
      console.log('  duplicates     - Find duplicate modules');
      console.log('  imports        - Analyze import patterns');
      console.log('  treeshake      - Analyze tree shaking opportunities');
      console.log('  report         - Generate full optimization report');
      console.log('  build-analyze  - Build with bundle analysis');
      console.log('');
      console.log('Usage: node scripts/bundle-optimizer.js <command>');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  BundleAnalyzer,
  BundleOptimizer,
};