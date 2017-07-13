// The socket stuff is below here
var socket = io()

$('#create').click(function(){
	var roomId = Math.random()
	//console.log(roomId)
    socket.emit("createRoom", roomId)
    $('#roomList').append('<p>' + roomId + '</p>')
})

$('#roomcheck').click(function(){
	socket.emit('giveId')
})

socket.on('confirmJoin', function(confirmJoin){
	console.log('You have joined room ' + confirmJoin)
})