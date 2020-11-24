const { ipcMain } = require('electron');
const { mainWindowChild } = require('../createWindow');

class addEvent {
	constructor(win){
		this.win = win;
		this.openChildWindow();
	}
	openChildWindow(){
		ipcMain.on('open-child-window', ()=>{
			let child = mainWindowChild({
				parent: this.win
			});
			child.loadURL("http://www.baidu.com");
			child.on('closed',()=>{
				console.log('child is closed');
				child = null;
			})
		})
	}
}

module.exports = addEvent;