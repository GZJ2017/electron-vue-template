process.env.NODE_ENV = 'development';
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

// 编译主线程
function buildMain(){
	const webpackMainConfig = require('./webpack.main.config.js');
	return new Promise((resolve, reject)=>{
		webpack(webpackMainConfig, err => {
			if(err) {
				console.log('打包主进程遇到Error！');
                reject(err);
			} else {
                resolve();
			}
		});
	})
}
// 编译渲染线程
function devRender(){
	const webpackDevConfig = require('./webpack.render.config.js');
	const compiler = webpack(webpackDevConfig);
	return new Promise((resolve, reject)=>{
	    new WebpackDevServer(compiler, {
			contentBase: webpackDevConfig.output.path,
			publicPath: webpackDevConfig.output.publicPath,
			hot: true,				// 开启热加载
		}).listen(8090, err => {
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