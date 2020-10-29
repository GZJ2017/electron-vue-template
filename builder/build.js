
process.env.NODE_ENV = 'production';
const chalk = require('chalk');
const del = require('del');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const renderConfig = require("./webpack.render.config.js");

const build = {
	setup: {},
	run(){
		del(['./app/*', './pack/*']);
		// 初始化版本信息
		this.initSetup();

		this.writeVersionConfig();
		this.writeContent();
		this.buildApp();
	},
	initSetup(){
		const setup = require('../config/version.js');
		const runTimeObj = {
			dev: '开发版',
			test: '测试版',
			release: '正式版'
		}
		setup.versionType = 'release';
		setup.versionName = runTimeObj.release;
		setup.publishTime = Date.now();
		Object.keys(runTimeObj).forEach(key=>{
			if(process.argv.indexOf(key) > 1){
				setup.versionType = key;
				setup.versionName = runTimeObj[key];
			}
		});
		this.runTime(setup.versionType);
		this.setup = setup;


	},
	runTime(val){
		console.log(
			chalk.black.bgYellow('当前环境为：')
			+ chalk.yellow.bgRed.bold(val)
			+ chalk.black.bgYellow('环境')
		);
	},
	writeVersionConfig(){
		fs.writeFileSync(path.join(__dirname, '../config/version.js'), `module.exports = ${JSON.stringify(this.setup, null, 4)}`);
	},
	writeContent(){
		// const context = require('../src/renderer/libs')
	},
	// 创建文件夹，如果文件夹已存在则什么都不做
	async createFolder(outpath){
		return new Promise(resolve=>{
			fs.exists(outpath, exists=>{
				if(!exists) fs.mkdirSync(outpath);
				resolve(1);
			});
		})
	},
	buildApp(){
		Promise.all([viewBuilder()]).then(async resolve => {
			resolve.forEach(res=> console.log('打包输出===>', res));

			let outpath = path.join(__dirname, '../pack/');
			console.log(`打包渲染进程完毕！压缩小版本`);
			// 创建一个pack目录
			await this.createFolder(outpath);
			let zipPath = renderConfig.output.path;
			let fileName = this.setup.versionType+ '-' + this.setup.version.join('.');
			let filePath = path.join(zipPath, `../pack/${fileName}.zip`);
			this.compress(zipPath, filePath, 7, (type, msg)=>{
				if(type === 'error'){
					Promise.reject('压缩文件出错：'+ msg);
				} else {
					this.packMain();
					console.log(`压缩包大小为：${(msg/ 1024/ 1024).toFixed(2)}MB`);
				}
			});
		}).catch(err=>{
			console.log('打包 view 出错===>', err);
			process.exit(1);
		})
	},
	packMain(){
		Promise.all([mainBuild()]).then(resolve=>{
			const electronBuilder = require('electron-builder');
			const packageJson = require('../package.json');
			resolve.forEach(res => console.log('打包输出===>', res));

			packageJson.version = this.setup.version.slice(0,3).join('.');
			fs.writeFileSync(path.join(__dirname, '../package.json'), JSON.stringify(packageJson,null,4));
			electronBuilder.build().then(()=>{
				// del(['./pack/*.yaml', './pack/*.yml', './pack/.blockmap']);
				// this.openExplorer();
			}).catch(error=>{
				console.log(error);
			})
		}).catch(err=>{
			console.log("打包main错误==>", err);
			process.exit(2);
		})
	},
	compress(filePath, zipPath, level = 9, callback){
		const archiver = require('archiver');
		const outpath = fs.createWriteStream(zipPath);
		const archive = archiver('zip', {
			zlib: {
				level
			}
		});

		archive.pipe(outpath);
		archive.directory(filePath, false);
		archive.on('error', err => {
			if(callback) callback('error', err);

		});
		outpath.on('close', ()=>{
			let size = archive.pointer();
			if(callback) callback('success', size);
		});

		archive.finalize();
	},
	// 打开文件管理器
	openExplorer() {
		const dirPath = path.join(__dirname, '..', 'pack');
		if (process.platform === 'darwin') {
			spawn('open', [dirPath]);
		} else if (process.platform === 'win32') {
			spawn('explorer', [dirPath]);
		} else if (process.platform === 'linux') {
			spawn('nautilus', [dirPath]);
		}
	}
}



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

const mainRenderConfig = require('./webpack.main.config');

function mainBuild(){
	return new Promise((resolve, reject)=>{
		console.log('打包App主进程');
		let log = '';
		del(['./app/main.js']);
		const mainRenderCompiler = webpack(mainRenderConfig);
		mainRenderCompiler.run((err,stats)=>{
			if(err){
				console.log('打包主进程出错');
				reject(chalk.red(err));
			} else {
				Object.keys(stats.compilation.assets).forEach(key => {
                    log += chalk.blue(key) + '\n';
                });
                stats.compilation.warnings.forEach(key => {
                    log += chalk.yellow(key) + '\n';
                });
                stats.compilation.errors.forEach(key => {
                    log += chalk.red(`${key}:${stats.compilation.errors[key]}`) + '\n';
                });
                log += chalk.green(`time：${(stats.endTime - stats.startTime) / 1000} s\n`) + '\n';
                console.log('打包主进程完毕！');
                resolve(log);
			}
		})
	})
}

build.run();

// viewBuilder().then(data=>{
// 	console.log("打包输出===>", data);
// }).catch(err=>{
// 	console.log("打包出错===>", err);
// 	process.exit(1);
// })