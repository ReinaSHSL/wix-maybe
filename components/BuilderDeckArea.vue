<template>
	<div class="builder-deck-area">
		<ul id="mainDeckDisplay" class="cardList">
			<li v-for='card in mainDeck' :key="mainDeck.card" @mouseover='preview(card)' @click='removeMain(card)'>
				<card-preview :card="card"/>
			</li>
		</ul>
        <ul id="lrigDeckDisplay" class="cardList">
        	<li v-for='card in lrigDeck' :key="lrigDeck.card" @mouseover='preview(card)' @click='removeLrig(card)'>
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
				this.mainDeck = deck.main
				this.lrigDeck = deck.lrig
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
		},
		removeMain (card) {
			let index = this.mainDeck.findIndex(x => x === card)
			this.mainDeck.splice(index, 1)
		},
		removeLrig (card) {
			let index = this.lrigDeck.findIndex(x => x === card)
			this.lrigDeck.splice(index, 1)
		}
	},
	watch: {
		addCard: function () {
			if (this.addCard.type === 'SIGNI' || this.addCard.type === 'SPELL') {
				this.mainDeck.push(this.addCard)
				console.log('uwu')
			} else {
				this.lrigDeck.push(this.addCard)
			}
		}
	},
	props: [ 'addCard' ]
}

</script>