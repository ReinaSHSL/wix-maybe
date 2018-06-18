<template>
	<img
		class="card-preview"
		:src="card.image || 'http://via.placeholder.com/364x500'"
	/>
</template>
<script>
	export default {
		props: ['card'],
		methods: {
			preview () {
				console.log(this.card.image, this.card.name, this.card.color, this.card.class, this.card.type, this.card.text, this.card.burst, this.card.level, this.card.id, this.card.attack)
				let image = this.image
				let name = this.name
				let color = this.color
				let cardClass = this.class
				let type = this.type
				let text = this.text
				let burst = this.burst
				let level = this.level
				let id = this.id
				let attack = this.attack
				//console.log(image, name, color, cardClass, type, text, burst, level, id, attack)
				//this.$emit('cardData', image, name, color, cardClass, type, text, burst, level, id, attack)
			}
		},
		data () {
			return {
				image: this.card.image,
				name: this.card.name,
				color: this.card.color,
				class: this.card.class,
				type: this.card.type,
				text: this.card.text,
				burst: this.card.burst,
				level: this.card.level,
				id: this.card.id,
				attack: this.card.attack
			}
		}
	}
</script>
