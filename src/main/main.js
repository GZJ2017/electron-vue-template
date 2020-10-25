const url = require("url");
const path = require("path");
const Shortcut = require('./shortcut');
const electron = require('electron');

class App {
	constructor({app, BrowserWindow}){
		this.app = app;
		this.BrowserWindow = BrowserWindow;

		this.win = null;
		this.eventHandle(this.app);
	}
	createWindow(){
		this.win = new this.BrowserWindow({
			width: 1200,
			height: 800,
			frame: false,
			// titleBarStyle: 'hidden',
			webPreferences:{
				nodeIntegration: true // 在渲染进程引入node模块
			}
		});
		this.win.loadURL("http://localhost:8090/");
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
		this.createWindow();
		new Shortcut(this.win);
	}
	closed(){
		this.win = null;
	}
}

new App(electron);
