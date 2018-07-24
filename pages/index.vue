<template>
	<div class="app" :class="{mobile}">
		<app-header
			:user="user"
			:rooms="joinedRooms"
			:mobile="mobile"
		/>
		<login-panel
			v-if="!user"
			@login="user = $event"
		/>
		<template v-else>
			<home-panel
				v-show="currentPanel === 'HomePanel'"
				:allRooms="allRooms"
				:joinedRooms="joinedRooms"
			/>
			<builder-panel
				v-show="currentPanel === 'BuilderPanel'"
			/>
			<keep-alive>
				<room-panel
					v-for="room in joinedRooms"
					:key="room.id"
					v-if="room && currentPanel === 'RoomPanel' && activeRoomId === room.id"
					:room="room"
				/>
			</keep-alive>
		</template>
	</div>
</template>

<script>
import AppHeader from '~/components/AppHeader.vue'
import LoginPanel from '~/components/LoginPanel.vue'
import HomePanel from '~/components/HomePanel.vue'
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
			sizes: {},
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
		mobile () {
			return this.sizes.width <= 600
		},
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

			// A game has started
			gameStart (roomId, fields) {
				const room = this.joinedRooms.find(room => room.id === roomId)
				if (!room) return console.warn(new TypeError('gameStart: room not found'))
				room.fields = fields
				room.inGame = true
			}
		}
	},
	mounted () {
		// Request the initial list of active rooms
		this.$socket.emit('getActiveRooms', null, rooms => {
			this.allRooms = rooms
		})

		// Handle resizes (used to compute responsive CSS classes)
		const window = this.$el.ownerDocument.defaultView
		this.sizes = {
			width: window.innerWidth,
			height: window.innerHeight
		}
		this.$nextTick(() => {
			window.addEventListener('resize', () => {
				this.sizes = {
					width: window.innerWidth,
					height: window.innerHeight
				}
			})
		})
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
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	display: grid;
	grid:
		"header" 33px
		"content" calc(100% - 33px)
		/ 100%;
}
.app.mobile {
	grid:
		"header" 41px
		"content" calc(100% - 41px)
		/ 100%;
}

.panel {
	grid-area: content;
}

/* Generics */
input[type="text"],
input[type="password"] {
	border: 1px solid #A9A9A9;
	border-radius: 2px;
	font-size: 13px;
	line-height: 15px;
	padding: 2px 5px;
	-webkit-appearance: none; /* mobile safari */
	margin: 0; /* also mobile safari, apparently we have to reset *everything* */
}
select {
	background: #FFF;
	border: 0;
	box-shadow: inset 0 0 0 1px #A9A9A9;
	border-radius: 2px;
	font-size: 13px;
	height: 21px;
	line-height: 15px;
	padding: 0 5px;
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
