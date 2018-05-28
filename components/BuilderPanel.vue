<template>
	<div class="builder-panel">
		<div class="builder-toolbar">
			<select id="deckList" v-model="deckId" @change="updateDecks()">
				<option
					v-for="deck in decks"
					:key="deck.id"
					:value="deck.id"
				>
					{{ deck.name }}
				</option>
			</select>
			<button type="button" button id='new' @click='newDeck()'>New Deck</button>
			<button type="button" button id='ren' @click='renameDeck()'>Rename Deck</button>
			<button type="button" button id='save' @click='saveDeck()'>Save Deck</button>
			<button type="button" button id='del' @click='deleteDeck()'>Delete Deck</button>
			<button type="button" button id='exim'>Export/Import</button>
		</div>
		<builder-deck-area :empty="!deckId" :mainDeck='mainDeck' :lrigDeck='lrigDeck'/>
		<builder-preview :card="hoveredCard"/>
		<builder-search-sidebar/>
	</div>
</template>
<script>
import BuilderSearchSidebar from '~/components/BuilderSearchSidebar.vue'
import BuilderPreview from '~/components/BuilderPreview.vue'
import BuilderDeckArea from '~/components/BuilderDeckArea.vue'
export default {
	components: {
		BuilderSearchSidebar,
		BuilderPreview,
		BuilderDeckArea
	},
	data () {
		return {
			hoveredCard: {},
			decks: [],
			deckId: '',
			mainDeck: [],
			lrigDeck: []
		}
	},
	methods: {
		updateDecks () {
			this.$socket.emit('updateDeck', this.deckId)
		},
		newDeck () {
			let deckName = prompt('Enter new deck name.')
			if (!deckName) return alert('Name is required.')
			let tempId = Math.random()
			let newDeck = {name: deckName, id: tempId}
			this.decks.push(newDeck)
			this.deckId = tempId
			this.mainDeck = []
			this.lrigDeck = []
		},
		renameDeck () {
			let newName = prompt('Enter new deck name.')
			if (!newName) return alert('New name is required.')
			this.decks.find(deck => deck.id === this.deckId).name = newName
		},
		deleteDeck () {
			this.$socket.emit('deleteDeck', this.deckId)
			let index = this.decks.findIndex(deck => deck.id === this.deckId)
			this.decks.splice(index, 1)
			this.deckId = ''
			this.mainDeck = []
			this.lrigDeck = []
			this.$socket.emit('loadDecks')
		},
		saveDeck () {
			let deckName = this.decks.find(deck => deck.id === this.deckId).name
			let deckId = this.decks.find(deck => deck.id === this.deckId).id
			let mainDeck = this.mainDeck
			let lrigDeck = this.lrigDeck
			alert(mainDeck)
			let currentDeck = {
				lrig: lrigDeck.map(card => card.id),
				main: mainDeck.map(card => card.id)
			}
			this.$socket.emit('saveDeck', {deck: currentDeck, name: deckName, id: deckId})
			this.$socket.emit('loadDecks')
		}
	},
	socket: {
		events: {
			loadDeck (decks) {
				this.decks = decks
			},
			deckUpdate (deck) {
				this.mainDeck = deck.main
				this.lrigDeck = deck.lrig
			}
		}
	},
}
</script>
<style>
.builder-panel {
	margin: 0;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	max-height: 100%;
	display: grid;
	grid:
		"toolbar toolbar toolbar" 33px
		"info deck    search" calc(100% - 33px)
		/ 251px auto 251px;
}
.mobile .builder-panel {
	grid:
		"toolbar toolbar" 33px
		"info deck" calc(100% - 33px)
		/ 151px auto;
}

.builder-deck-area {
	grid-area: deck;
}

.builder-toolbar {
	grid-area: toolbar;
	background: #FFF;
	border-bottom: 1px solid #DDD;
	line-height: 32px;
	padding: 0 10px;
}

.builder-info-sidebar {
	grid-area: info;
	padding: 10px;
	border-right: 1px solid #DDD;
	background: #FFF;
	overflow-y: scroll;
}
</style>
