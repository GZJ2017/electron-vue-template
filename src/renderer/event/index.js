/*
 * @Author: your name
 * @Date: 2020-10-26 21:15:35
 * @LastEditTime: 2020-12-06 15:14:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\src\renderer\event\index.js
 */
const { ipcRenderer } = require('electron');

export default {
	openInitiateWin(){
		ipcRenderer.send("open-initiate-win")
	},
	openViewWin(){
		ipcRenderer.send('open-view-win');
	}
}

