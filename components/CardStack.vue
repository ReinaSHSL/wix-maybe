<template>
	<div class="card-stack">
		<template v-if="this.cards">
			<card-preview :card="this.zone.cards[0]"/>
			<div class="card-stack-count">{{this.zone.cards.length}}</div>
		</template>
		<template v-else>
			<card-preview :card="this.zone.topCard"/>
			<div class="card-stack-count">{{this.zone.size}}</div>
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
