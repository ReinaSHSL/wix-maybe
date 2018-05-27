<template>
	<div class="panel builder">
		<builder-buttons :decks="decks"/>
		<builder-deck-area :mainDeck='mainDeck' :lrigDeck='lrigDeck'/>
		<builder-preview :card="hoveredCard"/>
		<builder-search-sidebar/>
	</div>
</template>
<script>
import BuilderSearchSidebar from '~/components/BuilderSearchSidebar.vue'
import BuilderPreview from '~/components/BuilderPreview.vue'
import BuilderDeckArea from '~/components/BuilderDeckArea.vue'
import BuilderButtons from '~/components/BuilderButtons.vue'
export default {
	components: {
		BuilderSearchSidebar,
		BuilderPreview,
		BuilderDeckArea,
		BuilderButtons
	},
	socket: {
		events: {
			loadDeck (deck) {
				this.decks.push(deck)
			},
			deckUpdate (deck) {
				this.mainDeck = deck.main
				this.lrigDeck = deck.lrig
			}
		}
	},
	data () {
		return {
			hoveredCard: {},
			decks: [],
			mainDeck: [],
			lrigDeck: []
		}
	}
}
</script>
<style>
.panel.builder {
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
