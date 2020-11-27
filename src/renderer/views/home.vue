<template>
<div class="home">
	<h1>{{txt}}</h1>
	<head-nav />
	<!-- <a href="https://www.github.com">GitHub</a> -->
	<Button @click="openWin">打开新的子窗口</Button>
	<Button @click="alert">弹窗按钮</Button>
	<Button @click="notice">显示通知</Button>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import headNav from '@/components/head';
export default {
	name: 'home',
	data(){
		return {
			txt: "hello electron"
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
			this.$event.openChildWindow();
		},
		alert(){
			alert('hello electron');
		},
		notice(){
			const myNotification = new Notification('Basic Notification', {
				body: 'Notification from the Renderer process'
			})

			myNotification.onclick = () => {
			  console.log('Notification clicked')
			}
		}
	}
}
</script>