const url = require("url");
const path = require("path");
const Shortcut = require('./shortcut');
const electron = require('electron');
const { mianWindow } = require('./createWindow');
const RegisterEvent = require('./registerEvent');
require("./libs/runCheck.js")();

class App {
	constructor({app}){
		this.app = app;

		this.win = null;
		this.eventHandle(this.app);
		this.registerEvent();
	}
	createWindow(){
		this.win = mianWindow();
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

