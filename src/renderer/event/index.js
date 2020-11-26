const { ipcRenderer } = require('electron');

export default {
	openChildWindow(){
		ipcRenderer.send("open-child-window")
	}
}

