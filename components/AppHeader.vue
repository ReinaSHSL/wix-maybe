<template>
	<header class="header">
		<div class="title-area">
			<h1 class="title"><a href="#">Batoru</a></h1>
			<button
				class="builder-toggle-button"
				v-if="user"
				@click="$parent.builderShown = !$parent.builderShown"
			>
				{{$parent.builderShown ? 'Close' : 'Open'}} Deck Builder
			</button>
		</div>
		<div v-if="user" class="current-user">
			Logged in as:&nbsp;
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
.header .title-area {
	display: flex;
}
.header .title {
	margin: 0 10px 0 0;
	font-size: inherit;
}
.header .title a {
	color: inherit;
	text-decoration: inherit;
}

.header .builder-toggle-button {
	margin: 5px 0;
}

.header .current-user {
	display: flex;
}
.header .logout-form {
	margin-left: 5px;
}
</style>
