<!--
 * @Author: your name
 * @Date: 2020-10-21 22:30:22
 * @LastEditTime: 2020-12-06 15:10:44
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-vue-template\src\renderer\views\home.vue
-->
<template>
<div class="home">
	<!-- <input type="text" @copy="copyHandle" @paste="pasteHandle"> -->
	<Button @click="openInitiate">发起屏幕共享</Button>
	<Button @click="openView">观看屏幕分享</Button>
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
		openInitiate(){
			this.$ev.openInitiateWin();
		},
		openView(){
			this.$ev.openViewWin();
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