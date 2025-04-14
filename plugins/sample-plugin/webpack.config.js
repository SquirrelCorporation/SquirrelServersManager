const path = require("path");
const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;

const pluginName = "sample-plugin";

// Shared dependencies config (matching host)
const sharedConfig = {
  react: { singleton: true, requiredVersion: false },
  "react-dom": { singleton: true, requiredVersion: false },
  antd: { singleton: true, requiredVersion: false },
  // Add other shared libs matching the host config if needed
};

module.exports = {
  mode: process.env.NODE_ENV || "development", // Use development or production mode
  entry: "./src/client/index.tsx", // Entry point of your plugin's client code
  output: {
    path: path.resolve(__dirname, "public/client"), // Output to the same directory as before
    // Important: Set publicPath for MF chunk loading
    publicPath: `/static-plugins/client/${pluginName}/`,
    // filename: 'bundle.js', // Not needed when using MF exposes usually
    clean: true, // Clean the output directory before build
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          // Use babel-loader first (optional, for wider compatibility)
          // {
          //   loader: 'babel-loader',
          //   options: {
          //     presets: ['@babel/preset-react', '@babel/preset-typescript'],
          //   },
          // },
          // Then ts-loader
          "ts-loader",
        ],
      },
      // Add rules for CSS, images, etc. if needed
      // {
      //   test: /\.css$/i,
      //   use: ['style-loader', 'css-loader'],
      // },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "samplePlugin",
      library: { type: "window", name: "samplePlugin" },
      filename: "remoteEntry.js",
      exposes: {
        "./SamplePluginComponent": "./src/client/SamplePluginComponent.tsx",
      },
      shared: sharedConfig,
    }),
    // Add other plugins like HtmlWebpackPlugin if needed for standalone testing
  ],
  devtool: "source-map", // Optional: for easier debugging
};
