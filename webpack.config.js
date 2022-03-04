const path = require('path');
const nodeExternals = require('webpack-node-externals');
const DotEnv = require('dotenv-webpack');

const {
  NODE_ENV = 'development'
} = process.env;

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  entry: './src/index.ts',
  devtool: NODE_ENV === 'development' ? 'inline-source-map' : false,
  mode: NODE_ENV,
  plugins: [
    new DotEnv()
  ],
  module: {
    rules: [
      {
        test: /\.(graphql|gql)$/,
        use: 'raw-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'node_modules'),
    ],
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
}