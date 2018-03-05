<template>
	<ul class="room-users">
		
	</ul>
</template>

<script>
import RoomUsersListItem from '~/components/RoomUsersListItem'

export default {
	components: {
		RoomUsersListItem
	}
}
</script>

<style>
.room-users {
	grid-area: users;
	border-left: 1px solid #DDD;
	background: #F7F7F7;
	margin: 0;
	padding: 0;
	list-style: none;
	overflow-y: scroll;
}
</style>
