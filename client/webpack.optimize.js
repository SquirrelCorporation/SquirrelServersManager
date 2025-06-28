/**
 * Webpack Bundle Optimization Configuration
 * Advanced optimizations for production builds
 */

const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  // ============================================================================
  // CODE SPLITTING OPTIMIZATION
  // ============================================================================
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor chunks (third-party libraries)
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
          maxSize: 250000, // 250KB max chunk size
        },
        
        // React & React ecosystem
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 30,
        },
        
        // Ant Design
        antd: {
          test: /[\\/]node_modules[\\/](@ant-design|antd)[\\/]/,
          name: 'antd',
          chunks: 'all',
          priority: 25,
        },
        
        // TanStack Query
        tanstack: {
          test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
          name: 'tanstack',
          chunks: 'all',
          priority: 25,
        },
        
        // Shared utilities and business logic
        shared: {
          test: /[\\/]src[\\/]shared[\\/]/,
          name: 'shared',
          chunks: 'all',
          priority: 15,
          minChunks: 2,
        },
        
        // Features (FSD architecture)
        features: {
          test: /[\\/]src[\\/]features[\\/]/,
          name(module) {
            // Extract feature name from path
            const match = module.context.match(/[\\/]features[\\/]([^[\\/]]+)/);
            return match ? `feature-${match[1]}` : 'features';
          },
          chunks: 'all',
          priority: 10,
          minChunks: 1,
        },
        
        // Pages (route-level splitting)
        pages: {
          test: /[\\/]src[\\/]pages[\\/]/,
          name(module) {
            // Extract page name from path
            const match = module.context.match(/[\\/]pages[\\/]([^[\\/]]+)/);
            return match ? `page-${match[1].toLowerCase()}` : 'pages';
          },
          chunks: 'all',
          priority: 10,
          minChunks: 1,
        },
        
        // Common chunks (shared across multiple entry points)
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          enforce: true,
        },
      },
    },
    
    // Runtime optimization
    runtimeChunk: {
      name: 'runtime',
    },
    
    // Module concatenation (scope hoisting)
    concatenateModules: true,
    
    // Tree shaking
    usedExports: true,
    sideEffects: false,
  },

  // ============================================================================
  // PERFORMANCE OPTIMIZATION
  // ============================================================================
  performance: {
    maxAssetSize: 500000, // 500KB
    maxEntrypointSize: 500000, // 500KB
    hints: 'warning',
    assetFilter: (assetFilename) => {
      // Only check JS and CSS files
      return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
    },
  },

  // ============================================================================
  // PLUGINS FOR OPTIMIZATION
  // ============================================================================
  plugins: [
    // Bundle analyzer (only in analyze mode)
    ...(process.env.ANALYZE_BUNDLE === 'true' ? [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: path.resolve(__dirname, 'bundle-report.html'),
        defaultSizes: 'gzip',
        generateStatsFile: true,
        statsFilename: path.resolve(__dirname, 'bundle-stats.json'),
      })
    ] : []),
  ],

  // ============================================================================
  // RESOLVE OPTIMIZATION
  // ============================================================================
  resolve: {
    // Module resolution optimization
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ],
    
    // Alias for shorter imports
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@entities': path.resolve(__dirname, 'src/entities'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@widgets': path.resolve(__dirname, 'src/widgets'),
    },
    
    // File extension resolution order
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    
    // Optimize package.json field resolution
    mainFields: ['browser', 'module', 'main'],
  },

  // ============================================================================
  // MODULE OPTIMIZATION
  // ============================================================================
  module: {
    rules: [
      // TypeScript optimization
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // Skip type checking for faster builds
              experimentalWatchApi: true,
              compilerOptions: {
                module: 'es2015', // Enable tree shaking
                target: 'es2017',
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
      
      // CSS optimization
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[local]__[hash:base64:5]',
              },
            },
          },
        ],
      },
      
      // Asset optimization
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8KB inline threshold
          },
        },
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },

  // ============================================================================
  // EXTERNAL DEPENDENCIES
  // ============================================================================
  externals: {
    // Externalize large libraries if served via CDN
    // 'react': 'React',
    // 'react-dom': 'ReactDOM',
  },
};

// ============================================================================
// ENVIRONMENT-SPECIFIC OPTIMIZATIONS
// ============================================================================

const createOptimizedConfig = (baseConfig, env = 'production') => {
  const optimizedConfig = { ...baseConfig };

  if (env === 'production') {
    // Production-specific optimizations
    optimizedConfig.mode = 'production';
    optimizedConfig.devtool = 'source-map';
    
    // Additional production plugins
    optimizedConfig.plugins = [
      ...optimizedConfig.plugins,
      // Add production-specific plugins here
    ];
  } else if (env === 'development') {
    // Development-specific optimizations
    optimizedConfig.mode = 'development';
    optimizedConfig.devtool = 'eval-cheap-module-source-map';
    
    // Faster rebuilds in development
    optimizedConfig.optimization.splitChunks.chunks = 'async';
  }

  return optimizedConfig;
};

// ============================================================================
  // BUNDLE SIZE MONITORING
// ============================================================================

const BUNDLE_SIZE_LIMITS = {
  'vendor': 300 * 1024, // 300KB
  'react': 150 * 1024,  // 150KB
  'antd': 200 * 1024,   // 200KB
  'shared': 100 * 1024, // 100KB
  'features': 50 * 1024, // 50KB per feature
  'pages': 75 * 1024,   // 75KB per page
};

const createBundleSizePlugin = () => {
  return {
    apply(compiler) {
      compiler.hooks.afterEmit.tap('BundleSizeMonitor', (compilation) => {
        const assets = compilation.assets;
        const warnings = [];
        
        Object.keys(assets).forEach(filename => {
          if (!filename.endsWith('.js')) return;
          
          const size = assets[filename].size();
          const chunkName = filename.split('.')[0];
          const limit = BUNDLE_SIZE_LIMITS[chunkName] || BUNDLE_SIZE_LIMITS.features;
          
          if (size > limit) {
            warnings.push(
              `Bundle ${filename} (${(size / 1024).toFixed(1)}KB) exceeds size limit (${(limit / 1024).toFixed(1)}KB)`
            );
          }
        });
        
        if (warnings.length > 0) {
          console.warn('\n⚠️  Bundle Size Warnings:');
          warnings.forEach(warning => console.warn(`  ${warning}`));
          console.warn('');
        }
      });
    },
  };
};

module.exports = {
  ...module.exports,
  createOptimizedConfig,
  createBundleSizePlugin,
  BUNDLE_SIZE_LIMITS,
};