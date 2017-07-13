// The socket stuff is below here
var socket = io()

//Creates room
$('#create').click(function(){
	var roomId = Math.random()
	//console.log(roomId)
    socket.emit("createRoom", roomId)
    $('#roomList').append('<li id = ' + i + '>' + '<a href=#>' + roomId + '</a>' + '</li>')
})
//Tells other clients to display room
socket.on('newRoom', function(newRoom){
    $('#roomList').append('<li id = ' + i + '>' + '<a href=#>' + newRoom + '</a>' + '</li>')
})
//On connection list all active rooms
socket.on('activeRooms', function(activeRooms){
	var roomList = $('#roomList')
    roomList.empty()
    for(i of activeRooms){
        roomList.append('<li id = ' + i + '>' + '<a href=#>' + i + '</a>' + '</li>')
    }
})

//Test functions
$('#roomcheck').click(function(){
	socket.emit('giveId')
})

socket.on('confirmJoin', function(confirmJoin){
	console.log('You have joined room ' + confirmJoin)
})

