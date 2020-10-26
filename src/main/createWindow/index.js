const { BrowserWindow, dialog } = require('electron');

const process = require('process');
const url = require('url');
const path = require('path');
const cookie = require('cookie');

const isDevMode = process.env.NODE_ENV === 'development';


module.exports = {
	mianWindow(options = {}){
		options = Object.assign({
			width: 1200,
			height: 800,
			autoHideMenuBar:true,
			webPreferences:{
				nodeIntegration: true // 在渲染进程引入node模块
			}
		}, options);
		return new BrowserWindow(options);
	},
	mainWindowChild(options ={}){
		options = Object.assign({
			width: 500,
			height: 500
		},options);
		return new BrowserWindow(options);
	}
}