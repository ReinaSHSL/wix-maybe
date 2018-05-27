<template>
	<header class="header">
		<div class="left" :class="{mobile}">
			<h1 class="title">
				<a href="#">Batoru</a>
			</h1>
			<div class="tabs" :class="{mobile}" v-if="$parent.user">
				<generic-tab
					hide-close="true"
					tab-title="Home"
					@click="homeClick"
					:active="homeActive"
				>
					<i class="fas fa-home"></i>
					{{mobile ? '' : 'Home'}}
				</generic-tab>
				<generic-tab
					hide-close="true"
					tab-title="Deck Builder"
					@click="builderClick"
					:active="builderActive"
				>
					<i class="fas fa-clone"></i>
					{{mobile ? '' : 'Decks'}}
				</generic-tab>
				<generic-tab
					v-if="!mobile"
					v-for="room in rooms"
					:key="room.id"
					:tab-title="'Battle room: ' + room.name"
					@click="roomClick(room)"
					@close="$parent.leaveRoom(room.id)"
					:active="$parent.currentPanel === 'RoomPanel' && $parent.activeRoomId === room.id"
				>
					{{room.name}}
				</generic-tab>
				<generic-tab
					v-if="mobile"
					hide-close="true"
					tab-title="Rooms"
					@click="drawerShown = !drawerShown"
					:active="drawerShown || $parent.currentPanel === 'RoomPanel'"
				>
					<i class="fas fa-bars"></i>
				</generic-tab>
			</div>
		</div>
		<div v-if="user && !mobile" class="current-user">
			Logged in as:&nbsp;
			<colored-username
				:user="user"
			/>
			<form
				action='/logout'
				method='post'
				class='logout-form'
			>
				<input type='Submit' value='Log Out' class='logout-button'>
			</form>
		</div>
		<div v-if="mobile" class="drawer" :class="{shown: drawerShown}">
			<ul class="drawer-list">
				<generic-tab
					class="vertical"
					v-for="room in rooms"
					:key="room.id"
					:tab-title="'Battle room: ' + room.name"
					@click="roomClick(room)"
					@close="$parent.leaveRoom(room.id)"
					:active="$parent.currentPanel === 'RoomPanel' && $parent.activeRoomId === room.id"
				>
					{{room.name}} ({{room.members.length}})
				</generic-tab>
			</ul>
		</div>
	</header>
</template>

<script>
import ColoredUsername from '~/components/ColoredUsername.vue'
import GenericTab from '~/components/GenericTab.vue'

export default {
	props: ['user', 'rooms'],
	components: {
		ColoredUsername,
		GenericTab
	},
	data () {
		return {
			joinedRooms: [],
			sizes: {},
			drawerShown: false
		}
	},
	computed: {
		mobile () {
			return this.sizes.width <= 600
		},
		hideOtherTabs () {
			return this.mobile && this.drawerShown
		},
		homeActive () {
			return this.$parent.currentPanel === 'HomePanel' && !this.hideOtherTabs
		},
		builderActive () {
			return this.$parent.currentPanel === 'BuilderPanel' && !this.hideOtherTabs
		},
		roomActive () {
			return this.$parent.currentPanel === 'RoomPanel'
		},
	},
	methods: {
		homeClick () {
			this.$parent.currentPanel = 'HomePanel'
			this.drawerShown = false
		},
		builderClick () {
			this.$parent.currentPanel = 'HomePanel'
			this.drawerShown = false
		},
		roomClick (room) {
			this.$parent.showRoom(room.id)
			this.drawerShown = false
		}
	},
	mounted () {
		const window = this.$el.ownerDocument.defaultView
		this.sizes = {
			width: window.innerWidth,
			height: window.innerHeight
		}
		this.$nextTick(() => {
			window.addEventListener('resize', () => {
				this.sizes = {
					width: window.innerWidth,
					height: window.innerHeight
				}
			})
		})
	}
}
</script>

<style>
.header {
	grid-area: header;
	flex: 0 0 auto;
	background: #F7F7F7;
	border-bottom: 1px solid #BBB;
	line-height: 32px;
	padding: 0 10px;
	display: flex;
	justify-content: space-between;
}
.header .left {
	display: flex;
}
.header .title {
	margin: 0;
	font-size: inherit;
}
.header .title a {
	color: inherit;
	text-decoration: inherit;
}

.header .tabs {
	margin-left: 10px;
	display: flex;
	align-items: stretch;
	padding: 0 5px;
}

.header .builder-toggle-button {
	margin: 5px 0;
}

.header .current-user {
	display: flex;
}
.header .logout-form {
	margin-left: 5px;
}

/* Mobile things */
.header .left.mobile {
	flex: 100%;
	justify-content: space-between;
}
.header .drawer {
	position: fixed;
	top: 33px;
	bottom: 0;
	left: 0;
	width: 100vw;
	background: rgba(0,0,0,0.7);
	display: flex;
	justify-content: flex-end;
	align-items: flex-start;
	opacity: 0;
	visibility: hidden;
	transition: 300ms;
}
.header .drawer.shown {
	opacity: 1;
	visibility: visible;
}
.header .drawer-list {
	margin: 0;
	padding: 0;
	position: relative;
	left: 100vw;
	width: calc(100vw - 50px);
	max-width: calc(80vw);
	height: 100%;
	background: #FFF;
	border-left: 1px solid #BBB;
	transition: inherit;
}
.header .drawer.shown .drawer-list {
	left: 0;
}
.header .tab.vertical {
	margin: 0;
	border-right: 0;
	border-top: 0;
	border-bottom-width: 1px;
}
.header .tab.vertical.active {
	box-shadow: inset 3px 0 orange;
}
</style>
