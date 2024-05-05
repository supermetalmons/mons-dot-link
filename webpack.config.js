const path = require('path');
const webpack = require('webpack');

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

  plugins: [
    new webpack.DefinePlugin({
      'process.env.MONS_FIREBASE_API_KEY': JSON.stringify(process.env.MONS_FIREBASE_API_KEY || false)
    })
  ],
};