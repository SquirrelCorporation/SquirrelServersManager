const path = require("path");
const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;

const pluginName = "todo-tasks-manager";

// Shared dependencies config (matching host)
const sharedConfig = {
  react: { singleton: true, requiredVersion: false },
  "react-dom": { singleton: true, requiredVersion: false },
  antd: { singleton: true, requiredVersion: false },
  // Add other shared libs matching the host config if needed
};

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: "./src/client/index.tsx",
  output: {
    path: path.resolve(__dirname, "public/client"),
    publicPath: `/static-plugins/client/${pluginName}/`,
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ["ts-loader"], // Simpler setup, add babel if needed
      },
      // Add CSS loader if plugin has its own CSS
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "todoTasksManager",
      library: { type: "window", name: "todoTasksManager" },
      filename: "remoteEntry.js",
      exposes: {
        "./TodoPluginComponent": "./src/client/TodoPluginComponent.tsx",
      },
      shared: sharedConfig,
    }),
  ],
  devtool: "source-map",
};
