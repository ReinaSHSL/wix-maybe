<template>
	<header class="header">
		<div class="left">
			<h1 class="title">
				<a href="#">Batoru</a>
			</h1>
			<div class="tabs" v-if="$parent.user">
				<generic-tab
					hide-close="true"
					tab-title="Home"
					@click="$parent.currentPanel = 'HomePanel'"
					:active="$parent.currentPanel === 'HomePanel'"
				>
					<i class="fas fa-home"></i>
					Home
				</generic-tab>
				<generic-tab
					hide-close="true"
					tab-title="Deck Builder"
					@click="$parent.currentPanel = 'BuilderPanel'"
					:active="$parent.currentPanel === 'BuilderPanel'"
				>
					<i class="fas fa-clone"></i>
					Decks
				</generic-tab>
				<generic-tab
					v-for="room in rooms"
					:key="room.id"
					:tab-title="'Battle room: ' + room.name"
					@click="$parent.showRoom(room.id)"
					@close="$parent.leaveRoom(room.id)"
					:active="$parent.currentPanel === 'RoomPanel' && $parent.activeRoomId === room.id"
				>
					{{room.name}}
				</generic-tab>
			</div>
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
import GenericTab from '~/components/GenericTab.vue'

export default {
	props: ['user', 'rooms'],
	components: {
		ColoredUsername,
		GenericTab
	},
	data () { return {
		joinedRooms: [{
			name: 'yes',
			id: 893
		}]
	}},
	methods: {
		hi () {
			window.alert('i')
		}
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
.header .left {
	display: flex;
}
.header .title {
	margin: 0;
	font-size: inherit;
}
.header .title a {
	color: inherit;
	text-decoration: inherit;
}

.header .tabs {
	margin-left: 10px;
	display: flex;
	align-items: stretch;
	padding: 0 5px;
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
