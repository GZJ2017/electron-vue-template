
process.env.NODE_ENV = 'production';
const chalk = require('chalk');
const del = require('del');
const webpack = require('webpack');
const renderConfig = require("./webpack.render.config.js");

del(["./app/*"]);

function viewBuilder(){
	return new Promise((resolve, reject)=>{
		console.log("打包渲染进程");
		const renderCompiler = webpack(renderConfig);
		renderCompiler.run((err, stats)=>{
			if(err){
				console.log("打包渲染进程Error");
				reject(chalk.red(err));
			} else {
				let log = "";
				stats.compilation.errors.forEach(key=>{
					log += chalk.red(`${key}:${stats.compilation.errors[key]}\n`);
				});
				stats.compilation.warnings.forEach(key=>{
					log += chalk.yellow(key)+ "\n";
				});
				Object.keys(stats.compilation.assets).forEach(key=>{
					log += chalk.blue(key)+ "\n";
				});
				log += chalk.green(`time:${(stats.endTime-stats.startTime)/1000}s\n`);
				resolve(log);
			}
		})
	})
}

viewBuilder().then(data=>{
	console.log("打包输出===>", data);
}).catch(err=>{
	console.log("打包出错===>", err);
	process.exit(1);
})