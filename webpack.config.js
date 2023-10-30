const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './main.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html'
    })
  ],
  resolve: {
    fallback: {
      'path': require.resolve('path-browserify'),
      'fs': false  // You can set this to false if you don't need 'fs' in your front-end code
    }
  }
};
