/* globals require, __dirname, process, module */
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ImageminWebpackPlugin = require('imagemin-webpack-plugin').default
const ImageminMozjpeg = require('imagemin-mozjpeg')
const fs = require('fs')

const output = {
  filename: 'main.js',
  path: path.join(__dirname, 'dist/assets'),
}

const rules = [
  {
    test: /\.js/,
    use: [
      {
        loader: 'babel-loader',
      },
    ],
  },
  {
    test: /\.scss/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
      },
      {
        loader: 'css-loader',
        options: {
          url: false,
          sourceMap: true,
          importLoaders: 2,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
          plugins: [require('autoprefixer')({})],
        },
      },
      {
        loader: 'sass-loader',
        options: {
          implementation: require('sass'),
          sassOptions: {
            sourceMap: true,
            outputStyle: 'compressed',
            fiber: require('fibers'),
          },
        },
      },
    ],
  },
]

const devServer = {
  open: true,
  contentBase: path.resolve(__dirname, 'dist'),
  watchContentBase: true,
  port: 3000,
}

const readdirRecursively = (dir, files = []) => {
  const paths = fs.readdirSync(dir)
  const dirs = []
  for (const path of paths) {
    const stats = fs.statSync(`${dir}/${path}`)
    if (stats.isDirectory()) {
      dirs.push(`${dir}/${path}`)
    } else {
      files.push(`${dir}/${path}`)
    }
  }
  for (const d of dirs) {
    files = readdirRecursively(d, files)
  }
  return files
}

const sourceFilesList = readdirRecursively('./src')
let htmlWebpackPluginList = []
sourceFilesList.forEach((file) => {
  if (!file.includes('.html')) return

  htmlWebpackPluginList.push(
    new HtmlWebpackPlugin({
      filename: `../${file.replace('./src/', '')}`,
      template: file,
    })
  )
})

const plugins = [
  new MiniCssExtractPlugin({
    filename: 'main.css',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: 'src/assets/images',
        to: 'images',
      },
    ],
  }),
  new ImageminWebpackPlugin({
    test: /\.(jpe?g|png|gif|svg)$/i,
    pngquant: {
      quality: '65-80',
    },
    gifsicle: {
      interlaced: false,
      optimizationLevel: 1,
      colors: 256,
    },
    svgo: {},
    plugins: [
      ImageminMozjpeg({
        quality: 85,
        progressive: true,
      }),
    ],
  }),
  ...htmlWebpackPluginList,
]

const config = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  watch: process.env.NODE_ENV === 'development' ? true : false,
  entry: './src/assets/js/index.js',
  output,
  module: {
    rules,
  },
  devServer,
  plugins,
}

module.exports = config
