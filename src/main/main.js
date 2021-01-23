/*
 * @Author: your name
 * @Date: 2020-10-21 22:08:16
 * @LastEditTime: 2020-12-27 11:50:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\src\main\main.js
 */
const url = require("url");
const path = require("path");
const shortcut = require('./shortcut');
const electron = require('electron');
const { createMianWin } = require('./createWindow');
const registerEvent = require('./registerEvent');
const createSocket = require('./socket');
const plugins = require('./plugins');

class App {
	constructor({app, BrowserWindow, session}){
		this.mode = process.env.NODE_ENV;
		this.app = app;
		this.session = session;
		this.BrowserWindow = BrowserWindow;
		this.win = null;
		this.runCheck();
		this.eventHandle(app);
	}
	runCheck(){
		const gotTheLock = this.app.requestSingleInstanceLock();
		if(!gotTheLock) return this.app.quit();
		this.app.on('second-instance', ()=>{
			let myWindows = this.BrowserWindow.getAllWindows();
			myWindows.forEach(win => {
				if (win && !win.isDestroyed()) {
					if (win.isMinimized()) win.restore();
					win.focus();
				}
			});
		})
	}
	createWindow(){
		this.win = createMianWin();
		this.mode === 'production';
		let filePath = this.mode === 'production'
			? url.pathToFileURL(path.join(__dirname, 'index.html')).href
			: "http://localhost:8090";
		this.win.loadURL(filePath);
		// 等待渲染进程页面加载完毕再显示窗口
		this.win.once('ready-to-show', () => this.win.show())
	}
	eventHandle(app){
		app.on('closed', () => this.closed());
		app.on('ready', () => this.ready());
		app.on('window-all-closed', () => this.windowAllClosed());
		app.on('activate', () => this.activate());
	}
	activate(){
		if(!this.win) this.createWindow();
	}
	windowAllClosed(){
		if(process.platform !== 'darwin') this.app.quit();
	}
	ready(){
		plugins.installPlugin();		// 安装插件
		this.createWindow(); 			// 创建主窗口
		createSocket.init();		// 创建socket
		shortcut.init();			// 设置快捷键
		registerEvent.init();	// 注册事件
	}
	closed(){
		this.win = null;
	}
}
let app = new App(electron);

