const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer');

module.exports = {
	installPlugin(){
		this.vueDevtools();
	},
	// vue 开发插件
	vueDevtools(){
		installExtension(VUEJS_DEVTOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err));
	}
}
