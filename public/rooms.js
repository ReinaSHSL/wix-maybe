// The socket stuff is below here
var socket = io()

//Creates room
$('#create').click(function(){
	var roomId = Math.random()
	//console.log(roomId)
    socket.emit("createRoom", roomId)
    $('#roomList').append('<li>' + roomId + '</li>')
})
//Tells other clients to display room
socket.on('newRoom', function(newRoom){
    $('#roomList').append('<li>' + newRoom + '</li>')
})
//On connection list all active rooms
socket.on('activeRooms', function(activeRooms){
	var roomList = []
    for(li of $('#roomlist'){
    	roomList.push
    })
	for(value of activeRooms){
		if(roomList.indexOf(activeRooms) > -1){
			roomList.splice($wrap,index(), 1)
			$wrap.remove()
		}
		else{
	    $('#roomList').append('<li>' + activeRooms + '</li>')
	    }
    }
})

//Test functions
$('#roomcheck').click(function(){
	socket.emit('giveId')
})

socket.on('confirmJoin', function(confirmJoin){
	console.log('You have joined room ' + confirmJoin)
})

