const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  // Config for portfolio/main/index.js -> portfolio/main.min.js
  {
    entry: './portfolio/main/index.js',
    output: {
      filename: 'main.min.js',
      path: path.resolve(__dirname, 'portfolio'),
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
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    mode: 'production',
  },
  // Config for portfolio/main/calc.js -> portfolio/calc.min.js
  {
    entry: './portfolio/main/calc.js',
    output: {
      filename: 'calc.min.js',
      path: path.resolve(__dirname, 'portfolio'),
    },
    externals: {
      jquery: 'jQuery',
      gsap: 'gsap',
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
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    mode: 'production',
  },
  // Config for portfolio/main/lottie-opt.js -> portfolio/lottie-opt.min.js
  {
    entry: './portfolio/main/lottie-opt.js',
    output: {
      filename: 'lottie-opt.min.js',
      path: path.resolve(__dirname, 'portfolio'),
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
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    mode: 'production',
  },
]; 