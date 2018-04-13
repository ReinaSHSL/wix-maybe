<template>
	<a
		href="#"
		class="tab"
		:class="cssClass"
		:title="tabTitle"
		@click="$emit('click')"
	>
		<span class="tab-content">
			<slot/>
		</span>
		<button
			v-if="!hideClose"
			@click.stop="$emit('close')"
			class="tab-close"
		>
			<i class="fas fa-times" :title="closeTitle"></i>
		</button>
	</a>
</template>

<script>
export default {
	props: ['active', 'hideClose', 'tabTitle', 'closeTitle'],
	computed: {
		cssClass () {
			return this.active ? 'active' : ''
		}
	}
}
</script>

<style>
.tab {
	flex: 0 0 auto;
	margin-top: 4px;
	line-height: 27px;
	padding: 0 10px;
	text-align: center;
	text-decoration: none;
	color: #666;
	border: 1px solid #DDD;
	border-bottom: 0;
	background: #FFF;
	margin-right: 4px;
	cursor: default;
	display: flex;
	align-items: center;
}
.tab.active,
.tab:hover {
	border-color: #BBB;
	color: inherit;
}
.tab.active {
	box-shadow: 0 2px 0 -1px #FFF;
}
.tab-close {
	background: none;
	border: 0;
	border-radius: 50%;
	color: #777;
	padding: 0;
	text-align: center;
	cursor: pointer;
	font-size: smaller;
	width: 18px;
	height: 18px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin: 0 -5px 0 5px;
}
.tab-close:hover {
	background: #DDD;
	color: #C66;
}
</style>
