<template>
	<header class="header">
		<div class="title-area">
			<h1 class="title"><a href="#">Batoru</a></h1>
			<button class="builder-button" style='display:none'>Open Deck Builder</button>
		</div>
		<div class="user-stuff">
			<span
				v-if="user"
				class="current-user username"
			>
				{{user.username}}
			</span>
			<form
				v-if="user"
				action='/logout'
				method='post'
				class='logout-form'
			>
				<input type='Submit' value='Log Out' style='display:none' class='logout-button'>
			</form>
		</div>
	</header>
</template>

<script>
export default {
	props: ['user']
}
</script>

<style>

</style>
