<template>
	<div class="room-view">
		<table class="room-messages">
			<room-message
				v-for="message in room.messages"
				:message="message"
			/>
		</table>
		<ul class="room-users"></ul>
		<input
			class="room-chatbar"
			type="text"
			placeholder="Write a message, and send with [Enter]"
			v-model="draftedMessage"
			@keydown.enter="sendMessage"
		/>
		<select class="room-deck-select">
			<option disabled selected>Choose a deck...</option>
		</select>
		todo readybutton
	</div>
</template>

<script>
import RoomMessage from '~/components/RoomMessage.vue'

export default {
	props: ['room'],
	data () {
		return {
			draftedMessage: ''
		}
	},
	methods: {
		sendMessage () {
			this.$socket.emit('sendRoomMessage', {
				roomId: this.room.id,
				msg: this.draftedMessage
			})
			this.draftedMessage = ''
		}
	},
	components: {
		RoomMessage
	}
}
</script>

<style>
.room-view {
	grid-area: main;
	max-height: 100%;
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

.room-users {
	grid-area: users;
	border-left: 1px solid #DDD;
	background: #F7F7F7;
	margin: 0;
	padding: 0;
	list-style: none;
	overflow-y: scroll;
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
</style>
