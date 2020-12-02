const { BrowserWindow, dialog } = require('electron');

module.exports = {
	createMianWin(options = {}){
		options = Object.assign({
			width: 1200,	// 窗口宽度
			height: 800,	// 窗口高度
			// autoHideMenuBar:true,
			backgroundColor: '#fff',	// 窗口背景颜色
			show: false,				// 创建窗口后不显示窗口
			hasShadow: false,
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