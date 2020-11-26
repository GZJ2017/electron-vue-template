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

let app = new Vue({
	store,
	router,
	render: h => h(App)
}).$mount("#app");