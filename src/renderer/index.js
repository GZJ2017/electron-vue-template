import Vue from 'vue';
import App from './App.vue';
import store from './store';
import router from './router';
import event from './event';
import 'view-design/dist/styles/iview.css';
import { 
	Button, 
	Table 
} from 'view-design';
Vue.component('Button', Button);
Vue.component('Table', Table);

Vue.prototype.$event = event;

// 定义环境变量
window.env = {
	NODE_ENV,	// node环境
	MODE,		// 所处环境
	VERSION, 	// 当前版本
};

let app = new Vue({
	store,
	router,
	render: h => h(App)
}).$mount("#app");
