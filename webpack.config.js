const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  // Config for main/index.js -> main.min.js
  {
    entry: './main/index.js',
    output: {
      filename: 'main.min.js',
      path: path.resolve(__dirname, '.'),
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
  // Config for main/calc.js -> calc.min.js
  {
    entry: './main/calc.js',
    output: {
      filename: 'calc.min.js',
      path: path.resolve(__dirname, '.'),
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
]; 