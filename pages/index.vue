<template>
	<div class="app">
		<app-header
			:user="user"
		/>

		<main class="panels">
			<login-panel
				v-if="!user"
			/>
			<builder-panel v-if="user && builderShown"/>
			<rooms-panel
				v-if="user && !builderShown"
			/>
			<global-chat-panel
				v-if="user && !builderShown"
			/>

			<section class="panel builder" style="display:none"><!-- The deck builder woo -->
				<!-- Preview column -->
				<div class="info-sidebar">
					<!-- This will be the card preview and shit -->
					<img id='previewCard' src='http://i.imgur.com/zKrhNaW.png'>
					<div id="cardInfo">
						<p id='cardsName'></p>
						<p>
							<span id='cardsType'></span>
							<span id='cardsColor' style="float:right;"></span>
						</p>
						<p id='cardsLevel'></p>
						<p id='cardsAttack'></p>
						<p id='cardsCost'></p>
						<p id='cardsLimit'></p>
						<p id='cardsClass'></p>
						<p id='cardsLrigType'></p>

						<textarea id="cardsText" name="txt"></textarea>
					</div>
				</div>

				<!-- This will be the buttons and shit -->
				<div class="toolbar" id="top">
					<label></label>
					<select id="deckList">
						<!--Shit will be added dynamically-->
					</select>
					<button type="button" button id='new'>New Deck</button>
					<button type="button" button id='ren'>Rename Deck</button>
					<button type="button" button id='save'>Save Deck</button>
					<button type="button" button id='del'>Delete Deck</button>
					<button type="button" button id='exim'>Export/Import</button>
				</div>

				<!-- Cards live here -->
				<div class="deck-display" id="deckDisplayWrap">
					<ul id="mainDeckDisplay" class="cardList"></ul>
					<ul id="lrigDeckDisplay" class="cardList"></ul>
				</div>

				<!-- Searching and all that good stuff -->
				<div class="search-sidebar">
					<!-- this shit searches out cards -->
					<div id="search">
						<input type="text" id="cardName" onkeyup="search()" placeholder="Card name">
						<input type="text" id="cardLevel" onkeyup="search()" placeholder="Level">
						<select id='cardColor' onchange="search()">
							<option value=''>Color</option>
							<option value='Red'>Red</option>
							<option value='Blue'>Blue</option>
							<option value='Green'>Green</option>
							<option value='Black'>Black</option>
							<option value='White'>White</option>
							<option value='Colorless'>Colorless</option>
						</select>
						<select id='cardType' onchange="search()">
							<option value=''>Type</option>
							<option value='SIGNI'>SIGNI</option>
							<option value='LRIG'>LRIG</option>
							<option value='ART'>ART</option>
							<option value='spell'>SPELL</option>
							<option value='RESONA'>RESONA</option>
						</select>
						<select id='cardClass' onchange="search()">
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
						<input type="checkbox" id='burst' value='burst' onclick="search()">Burst<br>
						<input type="checkbox" id='noBurst' value='noburst' onclick="search()">No Burst<br>
					</div>

					<!-- List that will contain card placeholders - children are added dynamically -->
					<div>
						<ul id="results" class="cardList"></ul>
					</div>
				</div>

			</section>
		</main>
	</div>
</template>

<script>
import axios from 'axios'

import AppHeader from '~/components/AppHeader.vue'
import LoginPanel from '~/components/LoginPanel.vue'
import RoomsPanel from '~/components/RoomsPanel.vue'
import GlobalChatPanel from '~/components/GlobalChatPanel.vue'
import BuilderPanel from '~/components/BuilderPanel.vue'

export default {
	data () {
		return {
			builderShown: false,
			user: null,
			loginForm: {
				username: '',
				password: ''
			},
			signupForm: {
				username: '',
				password: ''
			}
		}
	},
	components: {
		AppHeader,
		LoginPanel,
		RoomsPanel,
		GlobalChatPanel,
		BuilderPanel,
	},
	methods: {
		login (username, password) {
			axios.post('/login', {username, password}).then(response => {
				this.user = response.data
			}).catch(err => {
				if (err.response) {
					window.alert(err.response.data)
				} else {
					console.log(err, Object.keys(err))
				}
			})
		},
		signup (username, password) {
			axios.post('/signup', {username, password}).then(response => {
				window.alert(response.data)
			}).catch(err => {
				window.alert(err.response.data)
			})
		}
	}
}
</script>

<style>
body {
	margin: 0;
	font-family: sans-serif;
}

.app {
	margin: 0;
	font-family: sans-serif;
	height: 100vh;
	overflow: hidden;
	display: grid;
	grid:
		"header" 33px
		"content" calc(100% - 33px)
		/ 100%;
}

.panels {
	grid-area: content;
	display: flex;
	justify-content: center;
}
.panel { flex: 1 1 100%; }
.panel + .panel { border-left: 1px solid #BBB }

/* Generics */
input {
	border: 1px solid #A9A9A9;
	font-size: 13px;
	line-height: 15px;
	padding: 2px 5px;
}
input[type="submit"],
button {
	border: 1px solid #939393;
	background: linear-gradient(to bottom, #F6F6F6, #DEDEDE);
	font-size: 13px;
	line-height: 15px;
	padding: 2px 5px;
	border-radius: 2px;
}
input[type="submit"]:active,
button:active {
	background: linear-gradient(to top, #F6F6F6, #DEDEDE);
}
</style>
