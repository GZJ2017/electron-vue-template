const path = require('path');
const webpack = require('webpack');
const { dependencies } = require('../package.json');
const isDevMode = process.env.NODE_ENV === 'development';


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
	devtool: isDevMode ? 'cheap-module-source-map': 'source-map',
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
	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.DefinePlugin({}),
	],
	target: 'electron-main'
}