<template>
	<li
		class="room-user"
		:class="cssClass"
	>
		<colored-username
			:user="user"
		/>
		<span
			v-if="user.ready"
			class="ready-icon"
			title="This user will play in the next match."
		>
			*
		</span>
		<span
			v-if="user.owner"
			class="owner-icon"
			title="This user owns the room and will play in the next match."
		>
			@
		</span>
	</li>
</template>

<script>
import ColoredUsername from '~/components/ColoredUsername.vue'

export default {
	props: ['user'],
	computed: {
		cssClass () {
			return `${this.user.owner ? 'owner' : ''} ${this.user.ready ? 'ready' : ''}`
		}
	},
	components: {
		ColoredUsername
	}
}
</script>

<style>
.room-user {
	padding: 1px 5px;
	border-bottom: 1px dotted #DDD;
	list-style: none;
}
.room-user .owner-icon {
	color: red;
}
.room-user .ready-icon {
	color: blue;
}
</style>
