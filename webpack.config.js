const path = require('path');

module.exports = {
  entry: './src/index.ts',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
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
    historyApiFallback: true,
  },
};