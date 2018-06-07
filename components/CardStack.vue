<template>
	<div class="card-stack">
	    <template v-if="this.zone.hidden">
	        <!-- this is the code used for hidden zones -->
	        <card-preview :card="this.zone.topCard"/>
	        <div class="card-stack-count">{{this.zone.size}}</div>
	    </template>
		<template v-else>
			<div class="card-stack">
			    <card-preview :card="this.zone.cards[0]"/>
			    <div class="card-stack-count">{{this.zone.cards.length}}</div>
			</div>
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