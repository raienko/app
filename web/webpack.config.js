const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const appDirectory = path.resolve(__dirname, '../');

// Web config
const ReactNativeWebConfig = require('react-native-web-config/plugin');
const envFilePath = path.resolve(__dirname, '../.env');

const babelConfig = require('../babel.config');

// Babel loader configuration
const babelLoaderConfiguration = {
  test: /\.(tsx|jsx|ts|js|cjs)?$/,
  exclude: [
    {
      and: [
        // babel will exclude these from transpling
        path.resolve(appDirectory, 'node_modules'),
        path.resolve(appDirectory, 'ios'),
        path.resolve(appDirectory, 'android'),
      ],
      // whitelisted modules to be transpiled by babel
      not: [],
    },
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      // Presets and plugins imported from main babel.config.js in root dir
      presets: babelConfig.presets,
      plugins: ['react-native-web', ...(babelConfig.plugins || [])],
    },
  },
};

// Image loader configuration
const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    },
  },
};

// File loader configuration
const fileLoaderConfiguration = {
  test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'fonts/',
        include: path.resolve(
          __dirname,
          'node_modules/react-native-vector-icons',
        ),
      },
    },
  ],
};

const webViewConfiguration = {
  test: /postMock.html$/,
  use: {
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
    },
  },
};

module.exports = argv => {
  return {
    entry: path.resolve(appDirectory, 'index'),
    output: {
      clean: true,
      path: path.resolve(appDirectory, 'web/dist'),
      filename: '[name].[chunkhash].js',
      sourceMapFilename: '[name].[chunkhash].map',
      chunkFilename: '[id].[chunkhash].js',
    },
    resolve: {
      alias: {
        'react-native-config': 'react-native-web-config',
        'react-native-svg': 'react-native-svg-web',
        'lottie-react-native': 'react-native-web-lottie',
        'react-native-webview': 'react-native-web-webview',
      },
      extensions: [
        '.web.js',
        '.js',
        '.web.ts',
        '.ts',
        '.web.jsx',
        '.jsx',
        '.web.tsx',
        '.tsx',
        '.cjs',
      ],
    },
    module: {
      rules: [
        babelLoaderConfiguration,
        imageLoaderConfiguration,
        fileLoaderConfiguration,
        webViewConfiguration,
      ],
    },
    plugins: [
      // Fast refresh plugin
      new ReactRefreshWebpackPlugin(),

      // Plugin that takes public/index.html and injects script tags with the built bundles
      new HtmlWebpackPlugin({
        template: path.resolve(appDirectory, 'web/public/index.html'),
      }),

      // Defines __DEV__ and process.env as not being null
      new webpack.DefinePlugin({
        __DEV__: argv.mode !== 'production' || true,
        process: {env: {}},
      }),

      // web env support
      ReactNativeWebConfig(envFilePath),
    ],
    optimization: {
      // Split into vendor and main js files
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'initial',
          },
        },
      },
    },
  };
};
