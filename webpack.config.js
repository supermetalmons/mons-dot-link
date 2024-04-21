const path = require('path');

module.exports = {
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },

  devServer: {
    liveReload: true,
    hot: true,
    static: {
      directory: path.join(__dirname, '/'),
    },
    devMiddleware: {
      publicPath: '/dist/'
    },
    compress: true,
    port: 9000,
    watchFiles: ['src/**/*', './index.html'],
  },
};