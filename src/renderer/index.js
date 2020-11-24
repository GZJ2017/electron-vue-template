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