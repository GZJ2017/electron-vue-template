import Vue from 'vue';
import home from './views/home.vue';
import store from './store/index.js';

new Vue({
	el: '#app',
	store,
	render: h => h(home)
});