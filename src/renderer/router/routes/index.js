
import Home from '@/views/home.vue';
import Login from '@/views/login.vue';

export default [{
	path: '/',
	redirect: 'home'
},{
	name: 'home',
	path: '/home',
	component: Home
}, {
	name: 'path',
	path: '/login',
	component: Login
}];