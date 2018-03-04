<template>
	<section class="rooms-panel">
		<div class="rooms-tabs">
			<room-tab
				:room="{name: 'rooms', id: null}"
				:active="activeRoomId == null"
			/>
			<room-tab
				v-for="room in joinedRooms"
				:room="room"
				:active="activeRoomId === room.id"
				:key="room.id"
			/>
		</div>
		<div v-if="activeRoomId == null" class="rooms-list-view">
			<h2>Create a room</h2>
			<form @submit.prevent="createRoom">
				<input
					type="text"
					placeholder="Room Name"
					v-model="createRoomForm.name"
				/>
				<input
					type="text"
					placeholder="Password (optional)"
					v-model="createRoomForm.password"
				/>
				<input type="submit" value="Create Room">
			</form>
			<h2>Rooms</h2>
			<ul class="rooms-list">
				<li
					v-for="room in allRooms"
					class="rooms-list-item"
				>
					<a
						href="#"
						@click="joinRoom(room.id)"
					>
						<span class="name">{{room.name}}</span>
						<span v-if="room.hasPassword" class="info has-password">Has password</span>
						<span class="info members">{{room.members.length}} member{{room.members.length === 1 ? '' : 's'}}</span>
					</a>
        </li>
			</ul>
		</div>
		<room-view
			v-for="room in joinedRooms"
			v-if="activeRoomId === room.id"
			:room="room"
			:key="room.id"
		/>
	</section>
</template>

<script>
import RoomTab from '~/components/RoomTab.vue'
import RoomView from '~/components/RoomView.vue'

export default {
	data () {
		return {
			createRoomForm: {
				name: '',
				password: ''
			},
			joinedRooms: [],
			allRooms: [],
			activeRoomId: null
		}
	},
	methods: {
		selectRoom (id) {
			console.log(id)
			this.activeRoomId = id
		},
		leaveRoom (id) {
			this.$socket.emit('leaveRoom', id)
			const index = this.joinedRooms.findIndex(room => room.id === id)
			if (index === -1) {
				console.warn(new TypeError('leaveRoom: index of room is -1'))
				return
			}
			this.joinedRooms.splice(index, 1)
			this.selectRoom(null)
		},
		joinRoom (id) {
			console.log('@joinRoom', id)
			const room = this.allRooms.find(room => room.id === id)
			if (room.hasPassword) {
        var password = window.prompt('Room password?')
        this.$socket.emit('joinRoom', {id, password})
	    } else {
        this.$socket.emit('joinRoom', {id})
  	  }
		},
		createRoom () {
			this.$socket.emit('createRoom', this.createRoomForm)
		}
	},
	components: {
		RoomTab,
		RoomView,
	},
	created () {
		// There are changes to the list of existing rooms
		this.$socket.on('activeRooms', rooms => {
			console.log('[activeRooms]', rooms)
			this.allRooms = rooms
		})

		// We joined a room
		this.$socket.on('joinRoomSuccess', room => {
			console.log('[joinRoomSuccess]', room)
			this.joinedRooms.push(room)
			this.selectRoom(room.id)
		})

		// We couldn't join a room
		this.$socket.on('joinRoomFail', reason => {
			console.log('[joinRoomFail]', reason)
			window.alert(`Failed to join room: ${reason}`)
		})

		//
	}
}
</script>

<style>
.rooms-panel {
	display: grid;
	grid:
		"tabs" 33px
		"main" calc(100% - 33px)
		/ 100%;
	border-left: 0;
}

.rooms-panel .rooms-tabs {
	grid-area: tabs;
	display: flex;
	align-items: stretch;
	border-bottom: 1px solid #BBB;
	padding: 0 5px;
	background: #F7F7F7;
}

.rooms-list-view {
	padding: 10px;
}
.rooms-list:not(:empty) {
	border: 1px solid #DDD;
	padding: 0;
	list-style: none;
}
.rooms-list-view .rooms-list-item + .rooms-list-item {
	border-top: 1px solid #DDD;
}
.rooms-list .rooms-list-item a {
	display: block;
	padding: 5px 10px;
}
.rooms-list .rooms-list-item .info:before {
	content: " - "
}
</style>
