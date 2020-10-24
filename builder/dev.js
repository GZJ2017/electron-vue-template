
process.env.NODE_ENV = 'development';
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackHotMiddleware = require('webpack-hot-middleware');
const chalk = require('chalk');
const http = require('http');
const {spawn} = require('child_process');
const electron =  require('electron');
const path = require('path');


function buildMain(){
	const webpackMainConfig = require('./webpack.main.config.js');
	return new Promise((resolve, reject)=>{
		console.log("打包APP主进程");
		let log = '';
		const mainCompiler = webpack(webpackMainConfig);
		mainCompiler.run((err, stats)=>{
			let errorInfo = '';
            if (err) {
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
		})
	})
}

function startElectron(){
	let electronProcess = spawn(electron, [path.join(process.cwd(), 'app/main.js')]);
	electronProcess.stdout.on('data', data=>{
		electronLog(data, 'blue');
	});
	electronProcess.stderr.on('data', data=>{
		electronLog(data, 'red');
	})
}

function electronLog(data, color){
	let log = "";
	data.toString().split(/r?\n/).forEach(line=>{
		log+= `n${line}`;
	});
	if(/[0-9A-z]+/.test(log)){
		 console.log(
            chalk[color].bold('┏ Electron -------------------') + 
            log + 
            chalk[color].bold('┗ ----------------------------')
        );
	}

}


function devRender(){
	console.log('启动渲染进程调试.....');
	const webpackDevConfig = require('./webpack.render.config.js');
	const compiler = webpack(webpackDevConfig);
	new WebpackDevServer(compiler, {
		contentBase: webpackDevConfig.output.path,
		publicPath: webpackDevConfig.output.publicPath,
		inline: true,
		hot: true,
		quiet: true,
		progress: true,
		setup(app){
			app.use(webpackHotMiddleware(compiler));
			app.use('*', (req, res, next)=>{
				if(String(req.originaUrl).indexOf(".html") >0 ){
					getHtml(res);
				} else {
					next()
				}
			})
		}
	}).listen(8090, (err)=>{
		if(err) return console.log(err);
		console.log('Listening at http://loaclhost:8090');
	})

	compiler.hooks.done.tap('doneCallback', (stats) => {
        const compilation = stats.compilation;
        Object.keys(compilation.assets).forEach(key => console.log(chalk.blue(key)));
        compilation.warnings.forEach(key => console.log(chalk.yellow(key)));
        compilation.errors.forEach(key => console.log(chalk.red(`${key}:${stats.compilation.errors[key]}`)));
        console.log(chalk.green(`${chalk.white('渲染进程调试完毕\n')}time:${(stats.endTime-stats.startTime)/1000} s`));
    });
}
function getHtml(res) {
    http.get(`http://localhost:8099`, (response) => {
        response.pipe(res);
    }).on('error', (err) => {
        console.log(err);
    });
}


function build(){
	Promise.all([buildMain(), devRender()]).then(()=>{
		startElectron();
	}).catch(err=>{
		console.log(err);
		process.exit(1);
	})
}
build();