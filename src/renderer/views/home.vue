<template>
<div class="home">
	<h1>this is vue page {{txt}}</h1>
	<head-nav />
	<button @click="openWin">打开新的子窗口</button>
	<button>普通按钮</button>
</div>
</template>
<script>
import { mapGetters } from 'vuex';
import headNav from '@/components/head';
export default {
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
		async getData(){
			let count = await this.getCount()
			console.log(count);
		},
		getCount(){
			return new Promise(resolve=>{
				setTimeout(()=>resolve(666),100)
			})
		}
	}
}
</script>