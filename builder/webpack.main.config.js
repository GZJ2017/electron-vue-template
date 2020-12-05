/*
 * @Author: your name
 * @Date: 2020-10-22 20:16:53
 * @LastEditTime: 2020-12-05 20:18:41
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\builder\webpack.main.config.js
 */
const path = require('path');
const webpack = require('webpack');
const { dependencies } = require('../package.json');
const ElectronDevWebpackPlugin = require('electron-dev-webpack-plugin');
const isDevMode = process.env.NODE_ENV === 'development';
const { params } = require('./common.config');

const plugins = [
	new webpack.NoEmitOnErrorsPlugin(),
	new webpack.DefinePlugin({}),			// 定义变量
]

if(isDevMode) {
	plugins.push(new ElectronDevWebpackPlugin())	// 开发热加载electron应用)
}

module.exports = {
	mode: process.env.NODE_ENV,
	entry:{
		main: ['./src/main/main.js']
	},
	watch: true,
	output: {
		path: path.join(__dirname, '../app/'),
		libraryTarget: 'commonjs2',
		filename: '[name].js'
	},
	watch: isDevMode,
	optimization: {
		minimize: true
	},
	module: {
		rules: [{
			test: /\.js$/,
			loader: 'babel-loader',
			exclude: /node_modules/
		}]
	},
	externals: [
		...Object.keys(dependencies || {})
	],
	node: {
		__dirname: isDevMode,
		__filename: isDevMode
	},
	plugins,
	target: 'electron-main'
}