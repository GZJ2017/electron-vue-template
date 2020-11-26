const { ipcMain } = require('electron');
const { createChildWin } = require('../createWindow');
const path = require('path');

class addEvent {
	constructor(win){
		this.win = win;
		this.openChildWin();
	}
	openChildWin(){
		ipcMain.on('open-child-window', ()=>{
			let child = createChildWin({
				parent: this.win
			});

			let pathName = path.join(__dirname, '../../pages/html/update.html');
			child.loadFile(pathName);

			// child.loadURL("http://www.baidu.com");
			child.on('closed',()=>{
				console.log('child is closed');
				child = null;
			})
		})
	}
}

module.exports = addEvent;