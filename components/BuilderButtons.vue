<template>
	<div class="builder-toolbar">
		<select id="deckList" v-model="deckId" @change="updateDecks()">
			<option v-for="deck in decks" :value="deck.id"> {{ deck.name }} </option>
		</select>
		<button type="button" button id='new' @click='newDeck()'>New Deck</button>
		<button type="button" button id='ren'>Rename Deck</button>
		<button type="button" button id='save'>Save Deck</button>
		<button type="button" button id='del'>Delete Deck</button>
		<button type="button" button id='exim'>Export/Import</button>
	</div>
</template>
<script>
export default {
	methods: {
		updateDecks () {
			this.$socket.emit('updateDeck', this.deckId)
		},
		newDeck() {
			let deckName = prompt('Enter new deck name.')
			let tempId = Math.random()
			let newDeck = {name: deckName, id: tempId}
			if (deckName !== null) {
				this.$parent.decks.push(newDeck)
				document.getElementById('deckList').value = tempId
				console.log(document.getElementById('deckList').value)
				console.log(tempId)
			}
		}
	},
	props: [ 'decks' ],
	data () {
		return {
			deckId: ''
		}
	}
}
</script>