const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

let options =
{
    entry: './js/main.js',
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
                    presets: ['es2015', 'react', 'stage-0'],
                    plugins: ['transform-decorators-legacy'],
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{ loader: 'ifdef-loader', 
                options:
                {
                    DEBUG: process.env.ADS_TYPE == 'DEBUG',
                }
                }]
            },
            {
                test: /\.glsl$/,
                loader: 'webpack-glsl-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)(\?\S*)?$/,
                loader: 'file-loader'
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
            template: 'index.html',
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
