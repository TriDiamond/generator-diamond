const webpack = require("webpack");
const path = require("path");
const sass = require("sass");
const Fiber = require("fibers");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require("vue-loader-v16/dist/plugin.js").default;

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "dist")
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    }),
    new VueLoaderPlugin(),
    new webpack.HashedModuleIdsPlugin()
  ],
  resolve: {
    alias: {
      "@": path.resolve("./src")
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader-v16"
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              limit: 5000,
              name: "imgs/[hash].[ext]"
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: sass,
              sassOptions: {
                fiber: Fiber
              }
            }
          },
          "postcss-loader"
        ]
      }
    ]
  }
};
