var path = require('path'),
  uglify = require("uglifyjs-webpack-plugin");
module.exports = {
  mode: 'production',
  entry: './src/js/app.js',
  output: {
    path: path.resolve(__dirname, './build/js/'),
    filename: 'app.min.js',
  },
  devtool: false,
  module: {
    rules: [{
        test: /\.(js)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new uglify({
      uglifyOptions: {
          output: {
            comments: false
          },
          sourceMap: false
    }})
  ],
  externals: {
    // jquery: 'jQuery'
  }
}