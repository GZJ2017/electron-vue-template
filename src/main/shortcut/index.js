// 注册快捷键
const {app, globalShortcut} = require('electron');

class Shortcut {
	constructor(win){
		this.openTools(win);
	}
	register(key, cb){
		globalShortcut.register(key, cb);
	}
	// 注册打开控制台快捷键
	openTools(win){
		this.register('CommandOrControl+Shift+C',()=>{
			win.webContents.toggleDevTools({
				mode: 'right' // 在右侧打开控制台
			})
		})
	}
}

// 当所有窗口都关闭时，取消所有的快捷键注册
app.on('will-quit', ()=>{
	globalShortcut.unregisterAll();
})

module.exports = Shortcut;