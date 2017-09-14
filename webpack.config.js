const webpack = require('webpack')
const path = require('path');

var config = {
  entry: './src/ReduxFormHelper.js',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'redux-form-helper.js',
    library: 'ReduxFormHelper',
    libraryTarget: 'umd'
  }
}

if (process.env.NODE_ENV === 'production') {
  config.plugins = [
    new webpack.optimize.UglifyJsPlugin({ sourceMap: true })
  ]
  config.output.filename = 'redux-form-helper.min.js'; 
}

module.exports = config
