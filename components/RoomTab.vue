<template>
	<a
		href="#"
		class="rooms-tab"
		:class="cssClass"
		@click="$parent.selectRoom(room.id)"
	>
		<span class="tab-title">{{room.name}}</span>
		<button
			v-if="room.id != null"
			@click.stop="$parent.leaveRoom(room.id)"
			class="rooms-tab-close"
			title="Leave room"
		>
			Leave room
		</button>
	</a>
</template>

<script>
export default {
	props: ['room', 'active'],
	computed: {
		cssClass () {
			return this.active ? 'active' : ''
		}
	}
}
</script>

<style>
.rooms-tab {
    flex: 0 0 auto;
    margin-top: 4px;
    line-height: 27px;
    padding: 0 10px;
    text-align: center;
    text-decoration: none;
    color: #666;
    border: 1px solid #DDD;
    border-bottom: 0;
    background: #FFF;
    margin-right: 4px;
    cursor: default;
}
.rooms-tab.active,
.rooms-tab:hover {
    border-color: #BBB;
    color: inherit;
}
.rooms-tab.active {
    box-shadow: 0 2px 0 -1px #FFF;
}
.rooms-tab-close {
    background: none;
    border: 0;
    border-radius: 50%;
    color: #333;
    padding: 0;
    text-align: center;
    cursor: pointer;
    font-size: 0;
    width: 18px;
    margin: 0 -5px 0 2px;
}
.rooms-tab-close:hover {
    background: #DDD;
}
.rooms-tab-close::after {
    content: "\2716";
    font-size: small;
    position: relative;
    top: -0.75px;
}
</style>
