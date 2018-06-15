<template>
	<header class="header">
		<div class="left">
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
		<div
			v-if="mobile && user"
			class="drawer"
			:class="{shown: drawerShown}"
			@click="drawerShown = false"
		>
			<div class="drawer-content" @click.stop>
				<ul class="drawer-list">
					<li
						v-for="room in rooms"
						:key="room.id"
					>
						<generic-tab
							class="vertical"
							:tab-title="'Battle room: ' + room.name"
							@click="roomClick(room)"
							@close="$parent.leaveRoom(room.id)"
							:active="$parent.currentPanel === 'RoomPanel' && $parent.activeRoomId === room.id"
						>
							{{room.name}} ({{room.members.length}})
						</generic-tab>
					</li>
				</ul>
				<div class="user-info">
					<colored-username :user="user"/>
					<form
						action='/logout'
						method='post'
						class='logout-form'
					>
						<input type='Submit' value='Log Out' class='logout-button'>
					</form>
				</div>
			</div>
		</div>
	</header>
</template>

<script>
import ColoredUsername from '~/components/ColoredUsername.vue'
import GenericTab from '~/components/GenericTab.vue'

export default {
	props: ['user', 'rooms', 'mobile'],
	components: {
		ColoredUsername,
		GenericTab
	},
	data () {
		return {
			joinedRooms: [],
			drawerShown: false
		}
	},
	computed: {
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
			this.$parent.currentPanel = 'BuilderPanel'
			this.drawerShown = false
		},
		roomClick (room) {
			this.$parent.showRoom(room.id)
			this.drawerShown = false
		}
	}
}
</script>

<style>
.header {
	grid-area: header;
	flex: 0 0 auto;
	background: #F7F7F7;
	border-bottom: 1px solid #BBB;
	padding: 0 10px;
	display: flex;
	line-height: 32px;
	justify-content: space-between;
}
.header .left {
	flex: 1 1 auto;
	display: flex;
}
.header .right {
	flex: 0 0 auto;
}
.header .title {
	margin: 0;
	font-size: inherit;
	flex: 0 0 auto;
}
.header .title a {
	color: inherit;
	text-decoration: inherit;
}

.header .tabs {
	flex: 0 1 auto;
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
.mobile .header {
	font-size: 1.2em;
	line-height: 40px;
	padding-right: 0;
}
.mobile .header .left {
	/* The right part doesn't exist so we spread this out */
	flex: 100%;
	justify-content: space-between;
}
.header .drawer {
	position: fixed;
	z-index: 1;
	top: 41px;
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
.header .drawer-content {
	margin: 0;
	padding: 0;
	position: relative;
	left: 100vw;
	width: calc(100vw - 50px);
	max-width: calc(80vw);
	height: 100%;
	background: #F7F7F7;
	border-left: 1px solid #BBB;
	transition: inherit;
	display: flex;
	flex-direction: column;
}
.header .drawer.shown .drawer-content {
	left: 0;
}

.header .drawer-list {
	margin: 0;
	padding: 0;
	overflow: auto;
}
.header .drawer-list li {
	list-style: none;
}
.header .drawer-list li + li {
	border-top: 1px solid #DDD;
}
.header .tab.vertical {
	margin: 0;
	border: 0;
	padding: 5px 10px;
	justify-content: space-between;
	background: none;
}
.header .tab.vertical .tab-content {
	max-width: calc(100% - 25px);
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}
.header .tab.vertical .tab-close {
	width: 25px;
	height: 25px;
}
.header .tab.vertical.active {
	background: #FFF;
	box-shadow: inset 3px 0 orange;
}

.header .drawer .user-info {
	justify-self: flex-end;
	display: flex;
	justify-content: space-between;
	padding: 0 10px;
}
.header .drawer-list:not(:empty) + .user-info {
	border-top: 1px solid #BBB;
}
</style>
