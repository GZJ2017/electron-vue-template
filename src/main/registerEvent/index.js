const { ipcMain, app } = require('electron');
const { createChildWin } = require('../createWindow');
const path = require('path');
const url = require('url');

class addEvent {
	constructor(win){
		this.win = win;
		this.openChildWin();
	}
	getPath(file){
		let url = process.env.NODE_ENV === 'development'
			? '../../pages/html/' : 'pages/html/';
		return path.join(__dirname, url+file);
	}
	openChildWin(){
		ipcMain.on('open-child-window', ()=>{
			let child = createChildWin({
				// parent: this.win
			});
			let filePath = url.pathToFileURL(this.getPath('update.html')).href;
			child.loadURL(filePath);
			child.on('closed',()=>{
				console.log('child is closed');
				child = null;
			})
		})
	}
}

module.exports = addEvent;