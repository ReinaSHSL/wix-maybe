<template>
	<div class="builder-toolbar">
		<select id="deckList" v-model="deckId" @change="$parent.selectedDeckId = deckId">
			<option v-for="deck in decks" :value="deck.id"> {{ deck.name }} </option>
		</select>
		<button type="button" button id='new' @click = 'loadDecks()'>New Deck</button>
		<button type="button" button id='ren'>Rename Deck</button>
		<button type="button" button id='save'>Save Deck</button>
		<button type="button" button id='del'>Delete Deck</button>
		<button type="button" button id='exim'>Export/Import</button>
	</div>
</template>
<script>
export default {
	methods: {
		loadDecks () {
			this.$socket.emit('loadDecks')
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