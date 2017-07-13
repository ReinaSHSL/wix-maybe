// The socket stuff is below here
var socket = io()

//Creates room
$('#create').click(function(){
	var roomId = Math.random()
	//console.log(roomId)
    socket.emit("createRoom", roomId)
    $('#roomList').append('<p>' + roomId + '</p>')
})
//Tells other clients to display room
socket.on('newRoom', function(newRoom){
    $('#roomList').append('<p>' + newRoom + '</p>')
})
//Test functions
$('#roomcheck').click(function(){
	socket.emit('giveId')
})

socket.on('confirmJoin', function(confirmJoin){
	console.log('You have joined room ' + confirmJoin)
})

