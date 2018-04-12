<template>
	<div class="panel builder">
		<div class="builder-deck-area">
			<ul id="mainDeckDisplay" class="cardList"></ul>
            <ul id="lrigDeckDisplay" class="cardList"></ul>
		</div>
		<div class="builder-toolbar">
			<select id="deckList">
				<!-- Shit will be added dynamically TODO -->
			</select>
			<button type="button" button id='new'>New Deck</button>
			<button type="button" button id='ren'>Rename Deck</button>
			<button type="button" button id='save'>Save Deck</button>
			<button type="button" button id='del'>Delete Deck</button>
			<button type="button" button id='exim'>Export/Import</button>
		</div>
		<div class="builder-info-sidebar">
			<!-- This will be the card preview and shit -->
			<img id='previewCard' src='http://i.imgur.com/zKrhNaW.png'>
			<div id="cardInfo">
				<p id='cardsName'></p>
				<p>
					<span id='cardsType'></span>
					<span id='cardsColor' style="float:right;"></span>
				</p>
				<p id='cardsLevel'></p>
				<p id='cardsAttack'></p>
				<p id='cardsCost'></p>
				<p id='cardsLimit'></p>
				<p id='cardsClass'></p>
				<p id='cardsLrigType'></p>
	
				<textarea id="cardsText" name="txt"></textarea>
			</div>
		</div>
		<builder-search-sidebar/>
	</div>
</template>
<script>
import BuilderSearchSidebar from '~/components/BuilderSearchSidebar.vue'
export default {
	components: {
		BuilderSearchSidebar
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
		"info toolbar search" 33px
		"info deck    search" calc(100% - 33px)
		/ 251px auto 251px;
}

.builder-deck-area {
	grid-area: deck;
}

.builder-toolbar {
	grid-area: toolbar;
	background: #F7F7F7;
	border-bottom: 1px solid #DDD;
	line-height: 32px;
	padding: 0 10px;
}

.builder-info-sidebar {
	grid-area: info;
	padding: 10px;
	border-right: 1px solid #DDD;
	background: #EEE;
	overflow-y: scroll;
}
#previewCard {
    margin-bottom: 0px;
    padding: 0px;
    width: 100%;
}
#cardInfo p {
    margin: 5px 0;
}
#cardsName {
    text-align: center;
    font-weight: bold;
}
#cardsText {
    height: 250px;
    width: 100%;
    overflow-y: scroll;
    margin: 0;
    resize: none;
}
#cardsText:empty {
    display: none;
}
</style>
