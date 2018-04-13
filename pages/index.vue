<template>
	<div class="app">
		<app-header
			:user="user"
		/>
		<keep-alive v-if="user">
			<component :is="currentPanel" v-bind="currentProps"/>
		</keep-alive>
		<login-panel
			v-if="!user"
			@login="user = $event"
		/>
		<!--<login-panel-->
		<!--	v-if="!user"-->
		<!--/>-->
		<!--<builder-panel v-if="user && builderShown"/>-->
		<!--<home-panel-->
		<!--	v-if="user && !builderShown"-->
		<!--/>-->
		<!--<global-chat-panel-->
		<!--	v-if="user && !builderShown"-->
		<!--/>-->
	</div>
</template>

<script>
import axios from 'axios'

import AppHeader from '~/components/AppHeader.vue'
import LoginPanel from '~/components/LoginPanel.vue'
import HomePanel from '~/components/HomePanel.vue'
import GlobalChatPanel from '~/components/GlobalChatPanel.vue'
import BuilderPanel from '~/components/BuilderPanel.vue'

export default {
	data () {
		return {
			currentPanel: 'HomePanel',
			builderShown: false,
			user: null,
			joinedRooms: [],
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
	computed: {
		currentProps () {
			
		}
	},
	components: {
		AppHeader,
		LoginPanel,
		HomePanel,
		GlobalChatPanel,
		BuilderPanel,
	},
	socket: {
		events: {
			// We joined a room
			joinRoomSuccess (room) {
				console.log('[joinRoomSuccess]', room)
				this.joinedRooms.push(room)
			}
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

.panel {
	grid-area: content;
}

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
