<template>
<div class="home">
	<h1>this is vue page {{txt}}</h1>
	<head-nav />
	<button @click="openWin">打开新的子窗口</button>
	<button @click="alert">弹窗按钮</button>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import headNav from '@/components/head';
export default {
	name: 'home',
	data(){
		return {
			txt: "hello 111"
		}
	},
	components: {
		headNav
	},
	computed:{
		...mapGetters({
			userInfo: "getUserInfo"
		})
	},
	mounted(){
		console.log(this.userInfo);
		// this.getData();
	},
	methods: {
		openWin(){
			console.log(this.$event.openChildWindow())
		},
		alert(){
			alert('hello electron');
		}
	}
}
</script>