<template>
	<img class="card-preview" :src="card.image" :attr-name="card.name" :attr-color="card.color" :attr-class="card.class" :attr-type="card.type" :attr-cardtext="card.text" :attr-burst="card.burst" :attr-level="card.level" :attr-id="card.id" :attr-attack="card.attack"/>
</template>
<script>
	export default {
		props: ['card']
	}
</script>
