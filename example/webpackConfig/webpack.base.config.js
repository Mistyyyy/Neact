const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

console.log(path.resolve(__dirname, '../../index.js'))
module.exports = {
  entry: './src/entry.jsx',

  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].[hash].js',
    chunkFilename: '[name].[chunkhash].js',
    hashDigestLength: 8,
  },

  module: {
    rules: [
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.m?jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader?cacheDirectory'],
      },
      {
        test: /\.ejs$/,
        use: ['ejs-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|svg|ttf|woff|mp4|xlsx|xls)$/,
        use: ['file-loader?name=[hash:base64:7].[ext]'],
      },
    ],
  },

  resolve: {
    alias: {
      Neact$: path.resolve(__dirname, '../../lib/index.js')
    },

    modules: ['node_modules'],

    extensions: ['.js', '.json', '.jsx'],

    mainFields: ['browser', 'module', 'main'],

    mainFiles: ['index'],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
};
