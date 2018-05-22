<template>
	<div class="room-panel">
		<table class="room-messages">
			<room-message
				v-for="message in room.messages"
				:message="message"
			/>
		</table>
		<ul class="room-users-list">
			<room-users-list-item
				v-for="user in room.members"
				:key="user.id"
				:user="user"
			/>
		</ul>
		<input
			class="room-chatbar"
			type="text"
			placeholder="Write a message, and send with [Enter]"
			v-model="draftedMessage"
			@keydown.enter="sendMessage"
		/>
		<select
			class="room-deck-select"
			:disabled="ready"
		>
			<option disabled selected>Choose a deck...</option>
		</select>
		<label
			v-if="room.owner.id !== user.id"
			class="ready-button"
		>
			<input
				type="checkbox"
				class="ready-input"
				v-model="ready"
				@change="readyChange"
			/>
			Ready?
		</label>
		<div
			v-if="room.owner.id === user.id"
			class="start-button"
		>
			<button
				class="start-button-inner"
				@click="start"
				:disabled="!canStart"
			>
				Start!
			</button>
		</div>
	</div>
</template>

<script>
import RoomMessage from '~/components/RoomMessage.vue'
import RoomUsersListItem from '~/components/RoomUsersListItem.vue'

export default {
	props: ['room'],
	data () {
		return {
			draftedMessage: '',
			ready: false,
			selectedDeck: null
		}
	},
	computed: {
		user () {
			return this.room.members.find(user => user.id === this.$parent.user.id) || {}
		},
		canStart () {
			// The owner isn't labeled as ready, but one other user must have a deck
			// the game to start
			return this.room.members.some(user => user.ready)
		}
	},
	methods: {
		sendMessage () {
			this.$socket.emit('sendRoomMessage', {
				roomId: this.room.id,
				msg: this.draftedMessage
			})
			this.draftedMessage = ''
		},
		start () {
			// if (this.canStart)
			console.log('hi your shits broken')
		},
		readyChange () {
			if (this.ready) {
				// TODO: once we have the deck things built out, send the deck ID here
				// FIXME: trying to send a deck that doesn't exist breaks the UI
				// this.$socket.emit('deckInRoom', this.room.id, 'uwu')
				console.log('soon:tm:')
			} else {
				this.$socket.emit('unReady', this.room.id)
			}
		},
	},
	components: {
		RoomMessage,
		RoomUsersListItem,
	}
}
</script>

<style>
.room-panel {
	display: grid;
	grid:
		"messages users" calc(100% - 64px)
		"messages deck " 32px
		"chatbar  ready " 32px
		/ calc(100% - 150px) 150px;
	font-family: monospace;
}

/* Main message display area */
.room-messages {
	grid-area: messages;
	display: block;
	width: 100%;
	max-height: 100%;
	border-spacing: 0;
	overflow-y: scroll;
	font-size: 14px;
}

/* User list */
.room-users-list {
	grid-area: users;
	border-left: 1px solid #DDD;
	background: #F7F7F7;
	margin: 0;
	padding: 0;
	list-style: none;
	overflow-y: scroll;
	font-size: 14px;
}

.room-chatbar {
	grid-area: chatbar;
	border: 0;
	border-top: 1px solid #DDD;
	line-height: 32px;
	padding: 0 10px;
}

.room-deck-select {
	display: block;
	background: #FFF;
	border: 0;
	border-top: 1px solid #DDD;
	border-left: 1px solid #DDD;
	grid-area: deck;
	height: 100%;
	width: 100%;
}

/* Ready/start game buttons */
.ready-button, .start-button {
	grid-area: ready;
	display: flex;
	justify-content: center;
	align-items: center;
	border-left: 1px solid #DDD;
	border-top: 1px solid #DDD;
}
.ready-input {
	margin: 0 5px 0 0;
}
.start-button-inner {
	flex: 1 1 100%;
	display: block;
	margin: 0 5px;
}
</style>
