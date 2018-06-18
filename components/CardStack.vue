<template>
	<div class="card-stack" :class="{downed: false}"> <!-- TODO -->
		<template v-if="zone.cards">
			<card-preview :card="zone.cards[0] || {}"/>
			<div class="card-stack-count">{{zone.cards.length}}</div>
		</template>
		<template v-else>
			<card-preview :card="zone.topCard"/>
			<div class="card-stack-count">{{zone.size}}</div>
		</template>
	</div>
</template>

<script>
import CardPreview from '~/components/CardPreview.vue'
export default {
	props: ['zone'],
	components: {
		CardPreview,
	}
}
</script>

<style lang="scss">
.card-stack {
	position: relative;
	padding: 1px;

	.card-preview {
		display: block;
		margin-left: auto;
		margin-right: auto;
		max-height: calc(100vmin / 7 - 2px);
		max-width: calc(100vmin / 7 - 2px);
	}
	&.downed .card-preview {
		transform: rotate(-90deg);
		transform-origin: center;
	}
	
	.card-stack-count {
		position: absolute;
		line-height: 1;
		font-size: 18px;
		font-weight: bold;
		bottom: 2px;
		right: 5px;
		color: #FFF;
		text-shadow:
			1px 0 #000,
			1px 1px #000,
			0 1px #000,
			-1px 1px #000,
			-1px 0 #000,
			-1px -1px #000,
			0 -1px #000,
			1px -1px #000;
	}
}
</style>
