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
	}
}
</script>