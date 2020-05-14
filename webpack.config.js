const path = require('path');
const fs = require('fs');

const toolList = JSON.parse(fs.readFileSync("./ctm/resources/build.json", 'utf8'));

module.exports = {
  mode: 'none',
  entry: toolList,
  module: {
    rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    extensions: [".js", ".json", ".jsx", ".css", ".ts"]
  }
};
