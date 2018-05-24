<template>
	<div class="builder-deck-area">
		<ul id="mainDeckDisplay" class="cardList">
			<li v-for='card in deck' :key="deck.name">
				
			</li>
		</ul>
        <ul id="lrigDeckDisplay" class="cardList">
        </ul>
        <p>{{ deck }}</p>
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
		}
	},
	data () {
		return {
			mainDeck: [],
			lrigDeck: []
		}
	},
	props: [ 'deck' ]
}
</script>