<template>
	<img class="card-preview" :src="card.image" alt="card.name"/>
</template>
<script>
	export default {
		props: ['card']
	}
</script>
