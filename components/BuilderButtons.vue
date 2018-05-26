<template>
	<div class="builder-toolbar">
		<select id="deckList" v-model="deckId" @change="updateDecks()">
			<option v-for="deck in decks" :value="deck.id"> {{ deck.name }} </option>
		</select>
		<button type="button" button id='new' @click='newDeck()'>New Deck</button>
		<button type="button" button id='ren' @click='renameDeck()'>Rename Deck</button>
		<button type="button" button id='save' @click='saveDeck()'>Save Deck</button>
		<button type="button" button id='del' @click='deleteDeck()'>Delete Deck</button>
		<button type="button" button id='exim'>Export/Import</button>
	</div>
</template>
<script>
export default {
	methods: {
		updateDecks () {
			this.$socket.emit('updateDeck', this.deckId)
		},
		newDeck () {
			let deckName = prompt('Enter new deck name.')
			let tempId = Math.random()
			let newDeck = {name: deckName, id: tempId}
			if (deckName) {
				this.$parent.decks.push(newDeck)
				this.deckId = tempId
				this.$parent.mainDeck = []
				this.$parent.lrigDeck = []
			}
		},
		renameDeck () {
			let newName = prompt('Enter new deck name.')
			this.$parent.decks.find(deck => deck.id === this.deckId).name = newName
		},
		deleteDeck () {
			this.$socket.emit(deleteDeck, this.deckId)
			let index = this.$parent.decks.findIndex(deck => deck.id === this.deckId)
			this.$parent.decks.splice(index, 1)
			this.$parent.mainDeck = []
			this.$parent.lrigDeck = []
		},
		saveDeck () {
			let deckName = this.$parent.decks.find(deck => deck.id === this.deckId).name
			let deckId = this.$parent.decks.find(deck => deck.id === this.deckId).id
			let mainDeck = this.$parent.mainDeck
			let lrigDeck = this.$parent.lrigDeck
			let currentDeck = {
				lrig: lrigDeck.map(card => card.id),
				main: mainDeck.map(card => card.id)
			}
			this.$socket.emit('saveDeck', {deck: currentDeck, name: deckName, id: deckId})
		}
	},
	socket: {
		events: {
			updatedDeck () {
				alert('Your deck has been saved.')
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