const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeWebpack = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const baseConfig = require('./webpack.base.config');

const identity = d => d;

const smp = process.env.NODE_ANALYSIS ?
  new SpeedMeasurePlugin() :
  ({
    wrap: identity
  })

module.exports = webpackMerge(baseConfig, {
  mode: 'production',

  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
  },

  devtool: 'none',

  module: {
    rules: [{
      test: /\.css$/,
      oneOf: [{
          exclude: /node_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: true,
              },
            },
          ],
        },
        {
          include: /node_modules/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    }, ],
  },

  optimization: {
    minimize: true,
    noEmitOnErrors: true,
    runtimeChunk: {
      name: 'manifest',
    },
    namedModules: true,
    namedChunks: true,
    moduleIds: 'named',
    removeAvailableModules: false,
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
    flagIncludedChunks: true,
    occurrenceOrder: true,
    providedExports: false,
    usedExports: true,
    splitChunks: {
      // chunks: 'all',
      // name: false,
      // automaticNamePrefix: 'general-prefix',
      // automaticNameDelimiter: '-',
      // automaticNameMaxLength: 100,
      minChunks: 2,
      minSize: 0,
      maxSize: 300000,
      cacheGroups: {
        common: {
          test: /[\\/](node_modules)[\\/]/,
          name: 'common',
          maxSize: 200000,
          minSize: 0,
          chunks: 'initial',
          filename: '[name].chunk.js',
          enforce: false,
        },
      },
    },
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
    }),
    new OptimizeWebpack(),
  ].concat(
    process.env.NODE_ANALYSIS ? [
      new BundleAnalyzerPlugin(),
      new DuplicatePackageCheckerPlugin(),
    ] : []
  ),
});

module.exports = smp.wrap(module.exports)
