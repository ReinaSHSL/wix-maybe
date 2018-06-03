<template>
	<div class="room-panel" :class="{'in-game': inGame}">
		<table class="room-messages">
			<room-message
				v-for="(message, index) in room.messages"
				:key="index"
				:message="message"
			/>
		</table>
		<input
			class="room-chatbar"
			type="text"
			placeholder="Write a message, and send with [Enter]"
			v-model="draftedMessage"
			@keydown.enter="sendMessage"
		/>
		<div class="game-area" v-if="inGame">
			<!-- Things that show up when the game is being played -->
			<!-- oh god oh god what do i do uhhhh -->
			<button @click="inGame = !inGame">uhhh</button>
		</div>
		<template v-else>
			<!-- Things that show up when the game is not being played -->
			<ul class="room-users-list">
				<room-users-list-item
					v-for="user in room.members"
					:key="user.id"
					:user="user"
				/>
			</ul>
			<select
				class="room-deck-select"
				:disabled="ready"
				v-model="selectedDeck"
			>
				<option disabled selected>Choose a deck...</option>
				<option
						v-for="deck in decks"
						:key="deck.id"
						:value="deck.id"
				>
						{{ deck.name }}
				</option>
			</select>
			<label
				v-if="room.owner.id !== user.id"
				class="ready-button"
			>
				<input
					type="checkbox"
					class="ready-input"
					v-model="ready"
					:disabled="room.members.find(u => u.ready && u.id !== user.id)"
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
		</template>
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
			selectedDeck: null,
			decks: [],
			inGame: true // TODO: move to prop
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
				let roomId = this.room.id
				let deckId = this.selectedDeck
				this.$socket.emit('deckInRoom', roomId, deckId)
			} else {
				this.$socket.emit('unReady', this.room.id)
			}
		},
	},
	socket: {
		events: {
			loadDeck (decks) {
				this.decks = decks
			}
		}
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
		"chatbar  ready" 32px
		/ calc(100% - 150px) 150px;
	font-family: monospace;
}
.room-panel.in-game {
	grid:
		"game messages" calc(100% - 32px)
		"game chatbar"  32px
		/ calc(100% - 200px) 200px;
}
.mobile .room-panel {
	grid:
		"messages messages" calc(100% - 64px)
		"chatbar  chatbar " 32px
		"deck     ready   " 32px
		/ 50% 50%;
}
.mobile .room-panel.in-game {
	grid:
		"game" 100%
		/ 100%;
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

.room-panel .room-chatbar {
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
	border-radius: 0;
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

.game-area {
	grid-area: game;
	border-right: 1px solid #DDD;
}
</style>
