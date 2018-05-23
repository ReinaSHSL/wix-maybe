<template>
	<div class="builder-deck-area">
		<ul id="mainDeckDisplay" class="cardList"></ul>
        <ul id="lrigDeckDisplay" class="cardList"></ul>
	</div>
</template>
<script>
import CardPreview from '~/components/CardPreview.vue'
export default {
	components: {
		CardPreview
	},
	socket: {
		events: {
			/*loadDeck (deck) {
					for (let card of deck.deck.lrig) {
						this.lrigDeck.push(card)
						console.log(this.lrigDeck)
					}*/
		}
	},
	data () {
		return {
			mainDeck: [],
			lrigDeck: []
		}
	}
}
</script>