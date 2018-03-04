<template>
	<header class="header">
		<div class="title-area">
			<h1 class="title"><a href="#">Batoru</a></h1>
			<button class="builder-button" style='display:none'>Open Deck Builder</button>
		</div>
		<div v-if="user" class="current-user">
			<colored-username
				:user="user"
			/>
			<form
				action='/logout'
				method='post'
				class='logout-form'
			>
				<input type='Submit' value='Log Out' class='logout-button'>
			</form>
		</div>
	</header>
</template>

<script>
import ColoredUsername from '~/components/ColoredUsername.vue'

export default {
	props: ['user'],
	components: {
		ColoredUsername
	}
}
</script>

<style>
.header {
	grid-area: header;
	flex: 0 0 auto;
	background: #F7F7F7;
	border-bottom: 1px solid #BBB;
	line-height: 32px;
	padding: 0 10px;
	display: flex;
	justify-content: space-between;
}
.header .title {
	display: inline;
	margin: 0;
	font-size: inherit;
}
.header .title a {
	color: inherit;
	text-decoration: inherit;
}
.header .logout-form { display: inline }
</style>
