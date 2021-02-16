const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode : "development",
  entry: path.resolve(__dirname, "client/index.js"),
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'TP 9',
      inject: true,
      template: path.resolve(__dirname, "client/template/index.html"),

    })
  ],
}

