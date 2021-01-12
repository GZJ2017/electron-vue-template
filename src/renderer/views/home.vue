<!--
 * @Author: your name
 * @Date: 2020-10-21 22:30:22
 * @LastEditTime: 2021-01-12 20:46:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\src\renderer\views\home.vue
-->
<template>
<div class="home">
	<!-- <input type="text" @copy="copyHandle" @paste="pasteHandle"> -->
	<Button @click="openInitiate">打开一个新的窗口A</Button>
	<Button @click="openView">打开一个新的窗口B</Button>
	<Button @click="notice">显示通知</Button>
	<hr>
	<Button @click="sendA">向A窗口发出消息</Button>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import headNav from "@/components/head";
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
		openInitiate(){
			this.$ev.openInitiateWin();
		},
		openView(){
			this.$ev.openViewWin();
		},
		sendA(){
			this.$ev.sendAmessage({code: '2001'})
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
