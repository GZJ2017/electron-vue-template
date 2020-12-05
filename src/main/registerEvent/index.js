const { ipcMain, app } = require('electron');
const { createChildWin, createVideoWin } = require('../createWindow');
const path = require('path');
const url = require('url');
const http = require('http');
const fs = require('fs');

class addEvent {
	constructor(win){
		this.win = win;
		this.openChildWin();
		this.child = null;
		this.videoWin = null;
	}
	getPath(file){
		let url = process.env.NODE_ENV === 'development'
			? '../../pages/html/' : 'pages/html/';
		return path.join(__dirname, url+file);
	}
	openChildWin(){
		ipcMain.on('open-child-window', ()=>{
			if(this.child){
				return this.child.show();
			}
			this.child = createChildWin();
			let filePath = url.pathToFileURL(this.getPath('update.html')).href;
			this.child.loadURL(filePath);
			this.child.on('closed',()=>{
				this.child = null;
				console.log('child is closed');
			})
		})
	}
}

module.exports = addEvent;