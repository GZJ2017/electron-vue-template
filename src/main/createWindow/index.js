const { BrowserWindow, dialog } = require('electron');

module.exports = {
	createMianWin(options = {}){
		options = Object.assign({
			width: 1200,
			height: 800,
			autoHideMenuBar:true,
			backgroundColor: '#fff',
			show: false,
			// frame: false,
			webPreferences:{
				nodeIntegration: true, // 在渲染进程引入node模块
			}
		}, options);
		return new BrowserWindow(options);
	},
	createChildWin(options ={}){
		options = Object.assign({
			width: 500,
			height: 500,
			// modal: true,
			webPreferences: {
				nodeIntegration: true//默认是false
			}
		},options);
		return new BrowserWindow(options);
	}
}