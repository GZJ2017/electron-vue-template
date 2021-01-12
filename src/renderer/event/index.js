/*
 * @Author: your name
 * @Date: 2020-10-26 21:15:35
 * @LastEditTime: 2020-12-27 11:59:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\src\renderer\event\index.js
 */
import {ipcRenderer} from 'electron';

export default {
	openInitiateWin(){
		ipcRenderer.send("open-initiate-win")
	},
	openViewWin(){
		ipcRenderer.send('open-view-win');
	},
	sendAmessage(data = {}){
		ipcRenderer.send("a-message", data);
	}
}
