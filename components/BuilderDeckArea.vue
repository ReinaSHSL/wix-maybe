<template>
	<div class="builder-deck-area">
		<ul v-if="!empty" id="mainDeckDisplay" class="cardList">
			<li
				v-for='(card, index) in mainDeck'
				:key="index"
				@mouseover='preview(card)'
				@click='removeMain(index)'
			>
				<card-preview :card="card"/>
			</li>
		</ul>
		<ul v-if="!empty" id="lrigDeckDisplay" class="cardList">
			<li
				v-for='(card, index) in lrigDeck'
				:key="index"
				@mouseover='preview(card)'
				@click='removeLrig(index)'
			>
				<card-preview :card="card"/>
			</li>
		</ul>
		<div v-else class="empty-deck-display">
			No deck here. Try making a new one or something?
		</div>
	</div>
</template>
<script>
import CardPreview from '~/components/CardPreview.vue'
export default {
	components: {
		CardPreview
	},
	methods: {
		preview (card) {
			this.$parent.hoveredCard=card
		},
		removeMain (index) {
			this.$parent.mainDeck.splice(index, 1)
		},
		removeLrig (index) {
			this.$parent.lrigDeck.splice(index, 1)
		}
	},
	props: [ 'mainDeck', 'lrigDeck', 'empty' ]
}

</script>
<style>
.builder-deck-area {
	background: #F7F7F7;
	padding: 10px;
	overflow: auto;
}
.cardList {
	max-width: 800px;
	margin: 0 auto 5px;
	padding: 0;
	list-style: none;
	display: flex;
	flex-wrap: wrap;
}
.cardList li {
	flex: 0 0 80px;
}
.mobile .cardList li {
	flex: 0 0 40px;
}
.cardList .card-preview {
	display: block;
	max-width: 100%;
}
</style>