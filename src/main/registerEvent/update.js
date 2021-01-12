/*
 * @Author: your name
 * @Date: 2020-11-28 16:37:48
 * @LastEditTime: 2020-12-27 11:52:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\src\main\registerEvent\update.js
 */
const { ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const uploadUrl = 'http://localhost:9090';

function updateHandle(win){
	let message = {
		error: {status: -1, msg: '检测更新查询异常'},
		checking: {status: 0, msg: '正在检查更新...'},
		updateAva: {status: 1, msg: '检测到新版本,正在下载,请稍后'},
		updateNotAva: {status: 2, msg: '您现在使用的版本为最新版本,无需更新！'}
	}

	let versionInfo = '';
	autoUpdater.setFeedURL(uploadUrl);

	autoUpdater.on('error', function(){
		sendUpdateMessage(message.error);
	});

	autoUpdater.on('checking-for-update', ()=>{
		sendUpdateMessage(message.checking);
	});

	autoUpdater.on('updata-available', ()=>{
		sendUpdateMessage(message.updateAva);
	});

	autoUpdater.on('update-not-available',()=>{
		sendUpdateMessage(message.updateNotAva);
	});

	autoUpdater.on('download-propress', (progress)=>{
		win.webContents.send('downloadProgress', progress)
	});

	autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate)=>{
		ipcMain.on('isUpdateNow', (e, arg) => {
			console.log('开始更新');

			autoUpdater.quitAndInstall();
		});
 
		win.webContents.send('isUpdateNow');
	});

	ipcMain.on('checkForUpdate', ()=>{
		autoUpdater.checkForUpdates();
	})

	function sendUpdateMessage(text){
		win.webContents.send('message', text);
	}
}

module.exports = updateHandle;
