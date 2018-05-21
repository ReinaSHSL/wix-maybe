<template>
	<div class="app">
		<app-header
			:user="user"
			:rooms="joinedRooms"
		/>
		<login-panel
			v-if="!user"
			@login="user = $event"
		/>
		<template v-else>
			<home-panel
				v-show="currentPanel === 'HomePanel'"
				:allRooms="allRooms"
			/>
			<builder-panel
				v-show="currentPanel === 'BuilderPanel'"
			/>
			<room-panel
				v-for="room in joinedRooms"
				:key="room.id"
				v-if="room && currentPanel === 'RoomPanel' && activeRoomId === room.id"
				:room="room"
			/>
		</template>
		<!--<login-panel-->
		<!--	v-if="!user"-->
		<!--/>-->
		<!--<builder-panel v-if="user && builderShown"/>-->
		<!--<home-panel-->
		<!--	v-if="user && !builderShown"-->
		<!--/>-->
		<!--<global-chat-panel-->
		<!--	v-if="user && !builderShown"-->
		<!--/>-->
	</div>
</template>

<script>
import axios from 'axios'

import AppHeader from '~/components/AppHeader.vue'
import LoginPanel from '~/components/LoginPanel.vue'
import HomePanel from '~/components/HomePanel.vue'
// import GlobalChatPanel from '~/components/GlobalChatPanel.vue'
import BuilderPanel from '~/components/BuilderPanel.vue'
import RoomPanel from '~/components/RoomPanel.vue'

export default {
	data () {
		return {
			currentPanel: 'HomePanel',
			builderShown: false,
			user: null,
			joinedRooms: [],
			allRooms: [],
			activeRoomId: null,
			loginForm: {
				username: '',
				password: ''
			},
			signupForm: {
				username: '',
				password: ''
			}
		}
	},
	computed: {
		activeRoom () {
			return this.joinedRooms.find(room => room.id === this.activeRoomId)
		},
		currentProps () {
			if (this.currentPanel === 'RoomPanel') {
				return {
					room: this.activeRoom
				}
			} else {
				return {}
			}
		}
	},
	methods: {
		leaveRoom (id) {
			const index = this.joinedRooms.findIndex(room => room.id === id)
			if (index === -1) {
				console.warn(new TypeError('leaveRoom: room not found (this is where, in the future, we want to get a list of rooms the user is in from the server)'))
				return
			}
			this.$socket.emit('leaveRoom', id)
			this.joinedRooms.splice(index, 1)
			this.currentPanel = 'HomePanel'
		},
		showRoom (id) {
			this.activeRoomId = id
			this.currentPanel = 'RoomPanel'
			this.currentProps = {room: this.activeRoom}
		}
	},
	components: {
		AppHeader,
		LoginPanel,
		HomePanel,
		// GlobalChatPanel,
		BuilderPanel,
		RoomPanel,
	},
	socket: {
		events: {
			connect () {
				console.log('[connection]')
			},

			// There are changes to the list of existing rooms
			activeRooms (rooms) {
				console.log('[activeRooms]', rooms)
				this.allRooms = rooms
			},

			// We joined a room
			joinRoomSuccess (room) {
				console.log('[joinRoomSuccess]', room)
				this.joinedRooms.push(room)
				this.showRoom(room.id)
			},

			// We couldn't join a room
			joinRoomFail (reason) {
				console.log('[joinRoomFail]', reason)
				window.alert(`Failed to join room: ${reason}`)
			},

			// Someone sent a message
			newMessage (message) {
				const room = this.joinedRooms.find(room => room.id === message.roomId)
				if (!room) return console.warn(new TypeError('newMessage: room not found'))
				room.messages.push(message)
			},

			// Someone joined or left a room
			roomUsers (roomId, users) {
				const room = this.joinedRooms.find(room => room.id === roomId)
				if (!room) return console.warn(new TypeError('roomUsers: room not found'))
				room.members = users
			},
		}
	}
}
</script>

<style>
body {
	margin: 0;
	font-family: sans-serif;
}

.app {
	margin: 0;
	font-family: sans-serif;
	height: 100vh;
	overflow: hidden;
	display: grid;
	grid:
		"header" 33px
		"content" calc(100% - 33px)
		/ 100%;
}

.panel {
	grid-area: content;
}

/* Generics */
input {
	border: 1px solid #A9A9A9;
	font-size: 13px;
	line-height: 15px;
	padding: 2px 5px;
}
input[type="submit"],
button {
	border: 1px solid #939393;
	background: linear-gradient(to bottom, #F6F6F6, #DEDEDE);
	font-size: 13px;
	line-height: 15px;
	padding: 2px 5px;
	border-radius: 2px;
}
input[type="submit"]:active,
button:active {
	background: linear-gradient(to top, #F6F6F6, #DEDEDE);
}
</style>
