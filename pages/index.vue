<template>
	<div class="app">
		<app-header
			:user="user"
		/>

		<main class="panels">
			<!-- Initial screen - login/sighup stuff -->
			<login-panel
				v-if="!user"
			/>

			<section class="panel rooms" style="display:none">
				<div class="tabs">
					<a href="#" class="tab tab-rooms active">Rooms</a>
				</div>
				<div class="rooms-list">
					<h2>Create a room</h2>
					<input type="text" id="roomName" placeholder="Room Name">
					<input type="text" id="roomPass" placeholder="Password (optional)">
					<button class="create">Create Room</button>
					<h2>Rooms</h2>
					<ul class="roomsListUl"></ul>
				</div>
			</section>

			<section class="panel lobby" style="display:none">
				<p>This will be a public chatroom</p>
			</section>

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

		<!-- Scripts -->
		<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>

		<link rel="stylesheet" href="css/style.css">
		<link rel="stylesheet" href="css/builder.css">
		<link rel="stylesheet" href="css/rooms.css">
		<link rel="stylesheet" href="css/login.css">
	</div>
</template>

<script>
import AppHeader from '~/components/AppHeader.vue'
import LoginPanel from '~/components/LoginPanel.vue'
import axios from 'axios'

export default {
	data () {
		return {
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

</style>
