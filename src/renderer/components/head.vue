<template>
<div class="header">
	<ul>
		<li>this is head</li>
	</ul>
	<img :src="imgUrl" alt="">
	<div class="imgs"></div>
</div>
</template>
<script>
export default {
	data(){
		return {
			imgUrl: require("@/assets/tuite.png")
		}
	}
}
</script>
<style scoped lang="sass">
.header
	ul
		li
			font-size: 20px
			color: red
</style>

<!-- <style scoped>
.header {
	width: 500px;
	height: 500px;
	border: 1px solid #000;
}
.imgs {
	border: 5px solid red;
	width: 100px;
	height: 100px;
	background: url('@/assets/tuite.png');
}
</style> -->