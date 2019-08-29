//@ts-check

'use strict';

const path = require('path'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      webpack = require('webpack');

const serverConfig = {
    target: 'node',
    entry: './src/extension.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]'
    },
    externals: {
        vscode: 'commonjs vscode'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            },
            {
                test: /\.css$/i,
                use: 'ignore-loader'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            '__SERVER__': true
        })
    ]
};

const clientConfig = {
    target: 'web',
    entry: './src/webview/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'webview.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-typescript', '@babel/preset-react']
                        }
                    }
                ]
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: path.resolve(__dirname, 'dist')
                        }
                    },
                    'css-loader'
                ],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'webview.css',
            ignoreOrder: true
        }),
        new webpack.DefinePlugin({
            '__SERVER__': false
        })
    ]
};

module.exports = [serverConfig, clientConfig];