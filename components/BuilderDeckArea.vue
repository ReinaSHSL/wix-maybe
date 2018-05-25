<template>
	<div class="builder-deck-area">
		<ul id="mainDeckDisplay" class="cardList">
			<li v-for='card in mainDeck[0]' :key="mainDeck.card" @mouseover='preview(card)'>
				<card-preview :card="card"/>
			</li>
		</ul>
        <ul id="lrigDeckDisplay" class="cardList">
        	<li v-for='card in lrigDeck[0]' :key="lrigDeck.card" @mouseover='preview(card)'>
				<card-preview :card="card"/>
			</li>
        </ul>
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
			deckUpdate (deck) {
				this.mainDeck = []
				this.lrigDeck = []
				this.mainDeck.push(deck.main)
				this.lrigDeck.push(deck.lrig)
			}
		}
	},
	data () {
		return {
			mainDeck: [],
			lrigDeck: []
		}
	},
	methods: {
		preview (card) {
			this.$parent.hoveredCard=card
		}
	}
}
</script>