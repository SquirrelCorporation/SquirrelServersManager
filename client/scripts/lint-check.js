#!/usr/bin/env node

// Simple ESLint runner for checking code quality
const { ESLint } = require('eslint');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  fix: args.includes('--fix'),
  verbose: args.includes('--verbose')
};

// Get paths to lint
const paths = args.filter(arg => !arg.startsWith('--'));

if (paths.length === 0) {
  console.log('Usage: node scripts/lint-check.js [--fix] [--verbose] <file/dir...>');
  process.exit(0);
}

// Main function
async function main() {
  try {
    console.log('🔍 Running ESLint to check code quality...');

    // Initialize ESLint
    const eslint = new ESLint({
      fix: options.fix,
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      useEslintrc: true,
    });

    // Get absolute paths
    const resolvedPaths = paths.map(p => path.resolve(process.cwd(), p));

    // Verify paths exist
    for (const p of resolvedPaths) {
      if (!fs.existsSync(p)) {
        console.error(`Error: Path does not exist: ${p}`);
        process.exit(1);
      }
    }

    if (options.verbose) {
      console.log('Checking files in:', resolvedPaths);
    }

    // Lint files
    const results = await eslint.lintFiles(resolvedPaths);

    // Fix files if requested
    if (options.fix) {
      await ESLint.outputFixes(results);
    }

    // Format and output results
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);

    // Count issues
    const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
    const warningCount = results.reduce((sum, result) => sum + result.warningCount, 0);

    // Output results
    if (resultText) {
      console.log(resultText);
    }

    // Summary
    console.log('✅ Linting complete!');
    console.log(`Found ${errorCount} errors and ${warningCount} warnings`);

    // Exit with error code if there are errors
    if (errorCount > 0) {
      console.log('❌ Linting failed due to errors');
      process.exit(1);
    } else if (warningCount > 0) {
      console.log('⚠️ Linting passed with warnings');
    } else {
      console.log('✨ Linting passed with no issues!');
    }

  } catch (error) {
    console.error('Error running ESLint:');
    console.error(error);
    process.exit(1);
  }
}

// Run the main function
main();
