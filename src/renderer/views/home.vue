<template>
<div class="home">
	<h1>this is vue page {{txt}}</h1>
	<head-nav />
	<Button @click="openWin">打开新的子窗口</Button>
	<Button @click="alert">弹窗按钮</Button>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import headNav from '@/components/head';
export default {
	name: 'home',
	data(){
		return {
			txt: "hello electron123"
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