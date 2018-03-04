<template>
	
</template>

<script>
export default {

}
</script>

<style>
.rooms-list {
	padding: 10px;
}
.rooms-list .roomsListUl:not(:empty) {
	border: 1px solid #DDD;
	padding: 0;
	list-style: none;
}
.rooms-list .activeRoom + .activeRoom {
	border-top: 1px solid #DDD;
}
.rooms-list .activeRoom a {
	display: block;
	padding: 5px 10px;
}
.rooms-list .activeRoom .info:before {content: "- "}
</style>
