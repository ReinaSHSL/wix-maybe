<template>
    <div class="search-sidebar">
		<!-- this shit searches out cards -->
		<div id="search">
			<input type="text" id="cardName" @keyup="search()" placeholder="Card name" v-model='inputName'>
			<input type="text" id="cardLevel" @keyup="search()" placeholder="Level" v-model='inputLevel'>
			<select id='cardColor' @change="search()" v-model='inputColor'>
				<option value=''>Color</option>
				<option value='Red'>Red</option>
				<option value='Blue'>Blue</option>
				<option value='Green'>Green</option>
				<option value='Black'>Black</option>
				<option value='White'>White</option>
				<option value='Colorless'>Colorless</option>
			</select>
			<select id='cardType' @change="search()" v-model='inputType'>
				<option value=''>Type</option>
				<option value='SIGNI'>SIGNI</option>
				<option value='LRIG'>LRIG</option>
				<option value='ART'>ART</option>
				<option value='spell'>SPELL</option>
				<option value='RESONA'>RESONA</option>
			</select>
			<select id='cardClass' @change="search()" v-model='inputClass'>
				<option value=''>Class</option>
				<option value='Angel'>Angel</option>
				<option value='Apparition'>Apparition</option>
				<option value='Labyrinth'>Labyrinth</option>
				<option value='Space'>Space</option>
				<option value='Arm'>Arm</option>
				<option value='Valor'>Valor</option>
				<option value='Dragon Beast'>Dragon Beast</option>
				<option value='Riding Machine'>Riding Machine</option>
				<option value='Gem'>Gem</option>
				<option value='Ore'>Ore</option>
				<option value='Weapon'>Weapon</option>
				<option value='Wisdom'>Wisdom</option>
				<option value='Water Beast'>Water Beast</option>
				<option value='Electric Machine'>Electric Machine</option>
				<option value='Atom'>Atom</option>
				<option value='Trick'>Trick</option>
				<option value='Beautiful Technique'>Beautiful Technique</option>
				<option value='Earth Beast'>Earth Beast</option>
				<option value='Sky Beast'>Sky Beast</option>
				<option value='Cooking'>Cooking</option>
				<option value='Plant'>Plant</option>
				<option value='Playground Equipment'>Playground Equipment</option>
				<option value='Devil'>Devil</option>
				<option value='Misfortune Insect'>Misfortune Insects</option>
				<option value='Ancient Weapon'>Ancient Weapon</option>
				<option value='Bacteria'>Bacteria</option>
				<option value='Poison Fang'>Poison Fang</option>
				<option value='Origin Spirit'>Origin Spirit</option>
			</select>
			<input type="checkbox" id='burst' value='burst' @click="search()" v-model='checkBurst'>Burst<br>
			<input type="checkbox" id='noBurst' value='noburst' @click="search()" v-model='checkNoBurst'>No Burst<br>
		</div>
			<!-- List that will contain card placeholders - children are added dynamically -->
		<div>
			<ul id="results" class="cardList">
				<li v-for="card in results" :key="card.name">
 					<card-preview :card="card"/>
				</li>
			</ul>
		</div>
	</div>
</template>
<script>
import CardPreview from '~/components/CardPreview.vue'
export default {
	components: { CardPreview },
	methods: { search () {
		// If everything is empty, just return - no point in listing every card
		this.results = []
		if (!this.inputName && !this.inputLevel && !this.inputColor && !this.inputType && !this.inputClass) return
		this.$socket.emit('cardSearch', {
			inputName: this.inputName,
			inputLevel: this.inputLevel,
			inputColor: this.inputColor,
			inputType: this.inputType,
			inputClass: this.inputClass,
			checkBurst: this.checkBurst,
			checkNoBurst: this.checkNoBurst
		})
	}},
	data () { 
		return { 
			results: [],
			inputName: '',
			inputLevel: '',
			inputColor: '',
			inputType: '',
			inputClass: '',
			checkBurst: '',
			checkNoBurst: ''
		}
	},
	socket: {
  		events: {
    		cardMatches (cardMatches) {
				//console.log(cardMatches)
				this.results.push(cardMatches)
				console.log(this.results)
			}
		}
	}
}
</script>
<style>
.search-sidebar {
    grid-area: search;
    padding: 10px;
    border-left: 1px solid #DDD;
    background: #EEE;
}
.search-sidebar .cardList {
    justify-content: space-between;
}
.search-sidebar .cardList .card {
    margin-bottom: 5px;
}
.search-sidebar input {
    text-align: center;
}
.cardList {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
}
.card {
    width: 80px;
}
.card-preview {
    display: block;
    width: 100%;
    margin: 0;
}
</style>
