<template>
	<div class="builder-info-sidebar">
		<!-- This will be the card preview and shit -->
		<card-preview :card="card"/>
		<div id="cardInfo">
			<p id='cardsName'>{{ card.name }}</p>
			<p>
				<span id='cardsType'>{{ card.type }}</span>
				<span id='cardsColor' style="float:right;">{{ card.color  }}</span>
			</p>
			<p id='cardsLevel'>{{ card.level }}</p>
			<p id='cardsAttack'>{{ card.attack }}</p>
			<p id='cardsCost'>{{ card.cost }}</p>
			<p id='cardsLimit'>{{ card.limit }}</p>
			<p id='cardsClass'>{{ card.class }}</p>
			<p id='cardsLrigType'>{{ card.lrigType }}</p>

			<textarea id="cardsText" name="txt">{{ card.text }}</textarea>
		</div>
	</div>
</template>

<script>
import CardPreview from '~/components/CardPreview.vue'
export default {
	components: { CardPreview },
	props: [ 'card' ]
	
}
</script>
<style>
/* Preview image and left panel stuff */
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

textarea#cardsText:empty {
    display: none;
}
</style>