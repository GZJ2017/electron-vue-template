/*
 * @Author: your name
 * @Date: 2020-10-21 22:59:44
 * @LastEditTime: 2020-11-22 14:42:09
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\builder\dev.js
 */

process.env.NODE_ENV = 'development';
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');

// 编译主线程
function buildMain(){
	const webpackMainConfig = require('./webpack.main.config.js');
	return new Promise((resolve, reject)=>{
		webpack(webpackMainConfig, (err, stats) => {
			if(err) {
				console.log('打包主进程遇到Error！');
                reject(chalk.red(err));
			} else {
				logHandle(stats)
                resolve();
			}
		});
	})
}

function logHandle(stats) {
	const compilation = stats.compilation;
	Object.keys(compilation.assets).forEach(key => console.log('\n' + chalk.blue(key)));
	compilation.warnings.forEach(key => console.log('\n' + chalk.yellow(key)));
	compilation.errors.forEach(key => console.log('\n' + chalk.red(`${key}:${stats.compilation.errors[key]}`)));
	console.log('\n' + chalk.green(`time:${(stats.endTime-stats.startTime)/1000} s`));
}

// 编译渲染线程
function devRender(){
	const webpackDevConfig = require('./webpack.render.config.js');
	const compiler = webpack(webpackDevConfig);
	compiler.hooks.done.tap('doneCallback', logHandle);
	return new Promise((resolve, reject)=>{
	    new WebpackDevServer(compiler, {
			contentBase: webpackDevConfig.output.path,
			publicPath: webpackDevConfig.output.publicPath,
			inline: true,
			hot: true,
			quiet: true,
			progress: true
		}).listen(8090, (err)=>{
			if(err) {
				reject(err);
			}else {
				console.log('Listening at http://loaclhost:8090');
				resolve();
			}	
		})
	})
}


function build(){
	Promise.all([buildMain(), devRender()]).catch(err=>{
		console.log(err);
		process.exit(1);
	})
}
build();