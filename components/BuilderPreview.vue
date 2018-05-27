<template>
	<div class="builder-info-sidebar">
		<!-- This will be the card preview and shit -->
		<card-preview :card="card"/>
		<p class="card-name">{{ card.name }}</p>
		<p>
			<span id='cardsType'>{{ card.type }}</span>
			<span id='cardsColor' style="float:right;">{{ card.color }}</span>
		</p>
		<p>{{ card.level }}</p>
		<p>{{ card.attack }}</p>
		<p>{{ card.cost }}</p>
		<p>{{ card.limit }}</p>
		<p>{{ card.class }}</p>
		<p>{{ card.lrigType }}</p>
		<p class="card-text">{{ card.text }}</p>
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
.builder-info-sidebar p {
    margin: 5px 0;
}
.builder-info-sidebar .card-preview {
    margin-bottom: 0px;
    padding: 0px;
    width: 100%;
}
.card-name {
    text-align: center;
    font-weight: bold;
}
.card-text {
	font-size: smaller;
}

</style>