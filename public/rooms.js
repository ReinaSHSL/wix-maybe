// The socket stuff is below here
var socket = io()

//Creates room
$('#create').click(function(){
	var roomId = Math.random()
	//console.log(roomId)
    socket.emit("createRoom", roomId)
    $('#roomList').append('<li id = ' + roomId + ' class = activeRoom>' + '<a href=#>' + roomId + '</a>' + '</li>')
})

//Tells other clients to display room
socket.on('newRoom', function(newRoom){
    $('#roomList').append('<li id = ' + newRoom + ' class = activeRoom>' + '<a href=#>' + newRoom + '</a>' + '</li>')
})

//On connection list all active rooms
socket.on('activeRooms', function(activeRooms){
	var roomList = $('#roomList')
    roomList.empty()
    for(var i of activeRooms){
        roomList.append('<li id = ' + i + ' class = activeRoom>' + '<a href=#>' + i + '</a>' + '</li>')
    }
})

//Clicking on a room will make you join 
$('#roomList').on('click', ".activeRoom", function(){
	var enterRoom = (this.id)
	socket.emit('enteringRoom', enterRoom)
})

//Test functions

socket.on('confirmJoin', function(confirmJoin){
	console.log('You have joined room ' + confirmJoin)
})

socket.on('newClient', function(newClient){
	console.log('new client in room ' + newClient)
})

socket.on('message', function(message){
	console.log(message)
})