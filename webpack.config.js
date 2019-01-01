const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

let options =
{
    entry: './example/app.js',
    output:
    {
        path: path.resolve(__dirname, '.release'),
        filename: 'main.js',
        publicPath: process.env.NODE_ENV == 'production' ? './' : '/',
    },
    module:
    {
        rules:
        [
            {
                test: /\.(js|jsx)(\?\S*)?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query:
                {
                    presets: ['es2015', 'preact', 'stage-0'],
                }
            },
            {
                test: /\.glsl$/,
                loader: 'webpack-glsl-loader'
            },
            {
                test: /\.(vert|frag)$/,
                loader: 'raw-loader',
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(css|scss)$/,
                loader: 'style-loader!css-loader!sass-loader',
            },
            {
                test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)(\?\S*)?$/,
                loader: 'file-loader',
            }
        ]
    },
    devServer: {
        compress: true,
        disableHostCheck: true,
    },
    plugins:
    [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin(
        {
            template: 'example/index.html',
            inject: 'body',
        }),
    ],
    resolveLoader:
    {
        modules: [path.resolve('./node_modules'), process.env.NODE_PATH],
    },
    resolve:
    {
        modules: [path.resolve('./node_modules'), process.env.NODE_PATH],
    },
}
if (process.env.NODE_ENV == 'production')
{
    options.plugins.push(new UglifyJSPlugin())
}
module.exports = options
