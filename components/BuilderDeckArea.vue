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
			//
		}
	},
	methods: {
		preview (card) {
			this.$parent.hoveredCard=card
		},
		removeMain (card) {
			let index = this.$parent.mainDeck.findIndex(x => x === card)
			this.$parent.mainDeck.splice(index, 1)
		},
		removeLrig (card) {
			let index = this.$parent.lrigDeck.findIndex(x => x === card)
			this.$parent.lrigDeck.splice(index, 1)
		}
	},
	props: [ 'mainDeck', 'lrigDeck' ]
}

</script>
<style>
	.cardList {
		 max-width: 800px;
	}
	.cardList .card-preview {
		width: 80px;
    	list-style: none;
	}
	.cardList li {
 		display: inline-block;
	}
</style>