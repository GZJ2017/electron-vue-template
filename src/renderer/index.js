/*
 * @Author: your name
 * @Date: 2020-10-21 22:30:09
 * @LastEditTime: 2020-11-22 14:45:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\src\renderer\index.js
 */
import Vue from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import event from './event';

Vue.prototype.$event = event;

let app = new Vue({
	store,
	router,
	render: h => h(App)
}).$mount("#app");