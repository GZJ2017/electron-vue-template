const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isDevMode = process.env.NODE_ENV === 'development';
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { params } = require('./common.config');
const { version } = require('../config/version');

module.exports = {
	mode: isDevMode ? 'development': 'production',
	entry: {
		rebderer: path.join(__dirname, '../src/renderer/index.js')
	},
	output: {
		path: path.join(__dirname, '../app/'),
		publicPath: isDevMode ? '/': '',
		filename: 'js/[name].[contenthash].js',
		chunkFilename: 'js/[name].bundle.js',
	},
	module: {
		rules: [{
			test: /\.vue$/,
			loader: 'vue-loader'
		}, { // 配置sass语法支持，并且使用的是缩进格式
			test: /\.s[ac]ss$/,
			use: [
				...(
					isDevMode 
					? ['vue-style-loader', 'style-loader'] 
					: [MiniCssExtractPlugin.loader]
				),
				'css-loader',
				{
					loader: 'sass-loader',
					options: {
						sassOptions: {
				        	indentedSyntax: true // 如需使用花括号嵌套模式则设置为false
				        }
					}
				}
			]
		}, { // 配置支持css支持
			test: /\.css(\?.*)?$/,
			use: [
				...(
					isDevMode 
					? ['vue-style-loader', 'style-loader'] 
					: [MiniCssExtractPlugin.loader]
				),
				'css-loader'
			]
		}, { // 配置Babel将ES6+ 转换为ES5
			test: /\.js(\?.*)?$/,
			exclude: file => ( // 排除node_modules文件夹
				/node_modules/.test(file) &&
				!/\.vue\.js/.test(file)
			),
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env'],
					plugins: ['@babel/plugin-transform-runtime']
				}
			}
		}, { // 配置图片文件加载
			test: /\.(png|jpe?g|gif|tif?f|bmp|webp|svg)(\?.*)?$/,
			use: {
				loader: 'url-loader',
				options: {
					limit: 10000,
					esModule: false
				}
			}
		}, { // 配置字体文件加载
			test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
			use: {
				loader: 'file-loader',
				options: {
					esModule: false,
					limit: 10000
				}
			}
		}, { // 处理node文件
			test: /\.node$/,
			loader: 'node-loader'
		}]
	},
	node: {
		__dirname: isDevMode,
		__filename: isDevMode,
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
		new CleanWebpackPlugin({ // 清除所有文件，main.js文件除外
			cleanOnceBeforeBuildPatterns: ['**/*', '!main.js*']
		}),
		new HtmlWebpackPlugin({		// HTML页面模板插件
			template: './src/renderer/index.html',
			filename: './index.html',
			hash: true,
		}),
		new VueLoaderPlugin(),		// vue-loader 加载插件
		new MiniCssExtractPlugin({	// css打包成css文件插件
			filename: 'css/[name].css',
			chunkFilename: 'css/[id].css',
		}),
		new CopyPlugin({ // 复制静态文件
			patterns: [{
				from: path.join(__dirname, '../src/renderer/assets'),
				to: path.join(__dirname, '../app/assets')
			}, {
				from: path.join(__dirname, '../src/pages'),
				to: path.join(__dirname, '../app/pages')
			}]
		}),
		new webpack.DefinePlugin({
			VERSION: JSON.stringify(version.join('.')),		// 版本号
			MODE: JSON.stringify(params.mode),				// 运行的环境
			NODE_ENV: JSON.stringify(process.env.NODE_ENV)  // node环境
		})
	],
	target: 'electron-renderer',
}