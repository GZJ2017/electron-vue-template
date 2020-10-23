const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isDevMode = process.env.NODE_ENV === 'development';
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: isDevMode ? 'development': 'production',
	entry: {
		rebderer: path.join(__dirname, '../src/renderer/index.js')
	},
	output: {
		path: path.join(__dirname, '../app/'),
		publicPath: isDevMode ? '/': '',
		filename: '[name].[contenthash].js'
	},
	module: {
		rules: [{
			test: /\.vue$/,
			exclude: /node_modules/,
			loader: 'vue-loader'
		},{
			test: /\.s[ac]ss$/,
			use: [
				'vue-style-loader',
				'style-loader',
				'css-loader',
				{
					loader: 'sass-loader',
					options: {
						sassOptions: {
				        	indentedSyntax: true
				        }
					}
				}
			]
		}]
	},
	node: {
		__dirname: isDevMode,
		__filename: isDevMode
	},
	resolve: {
		// 引入文件时可以省略文件后缀名
		extensions:['.js','.json','.vue'],
		// 常用路径别名
		alias: {
			'@': path.join(__dirname, '../src/renderer/')
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/renderer/index.html',
			filename: './index.html',
			hash: true,
		}),
		new VueLoaderPlugin()
	]
}