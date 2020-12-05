<template>
<div class="home">
	<!-- <head-nav /> -->
	<!-- <a href="https://www.github.com">GitHub</a> -->
	<input type="text" @copy="copyHandle" @paste="pasteHandle">
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
			txt: "hello electron1"
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
			console.log(window.env);
			alert('hello electron');
		},
		// 复制事件
		copyHandle(e){
			console.log(e);
		},
		// 粘贴事件
		pasteHandle(e){
			console.log(e);
		},
		notice(){
			const myNotification = new Notification('通知标题', {
				body: '通知的主体内容'
			});
			myNotification.onclick = () => {
			  console.log('Notification clicked')
			}
		}
	}
}
</script>