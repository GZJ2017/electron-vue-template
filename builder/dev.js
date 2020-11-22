/*
 * @Author: your name
 * @Date: 2020-10-21 22:59:44
 * @LastEditTime: 2020-11-22 12:50:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\builder\dev.js
 */

process.env.NODE_ENV = 'development';
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');


function buildMain(){
	const webpackMainConfig = require('./webpack.main.config.js');
	return new Promise((resolve, reject)=>{
		console.log("打包APP主进程");
		let log = '';
		let errorInfo = '';
		webpack(webpackMainConfig, (err, stats) => {
			if(err) {
				console.log('打包主进程遇到Error！');
                reject(chalk.red(err));
			} else {
				Object.keys(stats.compilation.assets).forEach(key => {
                    log += chalk.blue(key) + '\n';
                })
                stats.compilation.warnings.forEach(key => {
                    log += chalk.yellow(key) + '\n';
                })
                stats.compilation.errors.forEach(key => {
                    errorInfo += chalk.red(`${key}:${stats.compilation.errors[key]}`) + '\n';
                })
                log += errorInfo+ chalk.green(`time：${(stats.endTime-stats.startTime)/1000} s\n`) + "\n";
                if(errorInfo){
                    reject(errorInfo)
                }else{
                    resolve(log);
                }
                console.log('打包主进程完毕！', log);
			}
		});
	})
}

function devRender(){
	console.log('启动渲染进程调试.....');
	const webpackDevConfig = require('./webpack.render.config.js');
	const compiler = webpack(webpackDevConfig);

	compiler.hooks.done.tap('doneCallback', (stats) => {
        const compilation = stats.compilation;
        Object.keys(compilation.assets).forEach(key => console.log(chalk.blue(key)));
        compilation.warnings.forEach(key => console.log(chalk.yellow(key)));
        compilation.errors.forEach(key => console.log(chalk.red(`${key}:${stats.compilation.errors[key]}`)));
        console.log(chalk.green(`${chalk.white('渲染进程调试完毕\n')}time:${(stats.endTime-stats.startTime)/1000} s`));
    });

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
	Promise.all([buildMain(), devRender()]).then(()=>{
		console.log("启动完毕")
	}).catch(err=>{
		console.log(err);
		process.exit(1);
	})
}
build();