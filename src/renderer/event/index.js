const { ipcRenderer } = require('electron');


export default {
	openChildWindow(){
		ipcRenderer.sendSync("open-child-window")
	}
}

