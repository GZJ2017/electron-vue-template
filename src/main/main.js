const url = require("url");
const path = require("path");
const Shortcut = require('./shortcut');
const electron = require('electron');
const { mianWindow } = require('./createWindow');
const RegisterEvent = require('./registerEvent');
require("./libs/runCheck.js")();

class App {
	constructor({app, BrowserWindow}){
		this.mode = process.env.NODE_ENV;
		this.app = app;
		this.BrowserWindow = BrowserWindow;
		
		this.win = null;
		this.runCheck();
		this.eventHandle(this.app);
		this.registerEvent();
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
		this.win = mianWindow();
		let filePath = '';
		if(this.mode === 'production'){
			filePath = url.pathToFileURL(path.join(__dirname, 'index.html')).href;
		} else {
			filePath = "http://localhost:8090/";
		}
		this.win.loadURL(filePath);
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
	registerEvent(){
		this.event = new RegisterEvent(this.win);
	}
	ready(){
		this.createWindow();
		new Shortcut(this.win);
	}
	closed(){
		this.win = null;
	}
}

let app = new App(electron);

module.exports = app; 

