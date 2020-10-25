<template>
<div class="home">
	<h1>this is vue page {{txt}}</h1>
	<head-nav />
</div>
</template>
<script>
import { mapGetters } from 'vuex';
import headNav from '@/components/head'
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