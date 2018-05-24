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