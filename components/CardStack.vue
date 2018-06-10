<template>
	<div class="card-stack">
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
