var pregame = $('#pregame')
var lobby = $('#lobby')
lobby.hide()

// The socket stuff is below here
var socket = io()

//Username stuff

$('#setUser').click(function(){
	var username = $('#username').val()
	socket.emit('setUser', username)
})

$("#testButton").click(function(){
	socket.emit('userTest')
})

//Room stuff

//Creates room
$('#create').click(function(){
	var roomName = $('#roomName').val()
	if(roomName === ''){
		alert('Please set a room name')
	}
	else{
	var roomId = Math.random()*1000000000000000000
    socket.emit("createRoom", {id: roomId, name: roomName})
    pregame.hide()
    lobby.show()
    $('#roomList').append('<li id = ' + roomId + ' class = activeRoom>' + '<a href=#>' + roomName + '</a>' + '</li>')
    }
})

//On connection list all active rooms
socket.on('activeRooms', function(activeRooms){
	var roomList = $('#roomList')
	roomList.empty()
    for(var i = 0; i < (Object.keys(activeRooms)).length; i++){
       	$('#roomList').append('<li id = ' + Object.keys(activeRooms)[i] + ' class = activeRoom>' + '<a href=#>' + activeRooms[Object.keys(activeRooms)[i]].name + '</a>' + '</li>')
    }
})

//Clicking on a room will make you join
$('#roomList').on('click', ".activeRoom", function(){
	var enterRoom = (this.id)
	socket.emit('enteringRoom', enterRoom)
	socket.on('roomSuccess', function(){
	    pregame.hide()
        lobby.show()
    })
})

//What happens if you try to join a full room
socket.on('roomFull', function(){
	alert('Room is full')
})

//Delete empty rooms
socket.on('emptyRoom', function(emptyRoom){
$('#' + emptyRoom).remove()
})

//Lobby stuff

//Chatbox sends msg
$('#msgBox').keydown(function(e){
	var key = e.which
	if(key === 13){
		var msg = $('#msgBox').val()
		socket.emit('lobbyMsg', msg)
		$('#msgBox').val('')
	}
})

//Display new msg
socket.on('newLobbyMsg', function(newLobbyMsg){
    var lobbyMsgs = $('#lobbyChat').val()
    $('#lobbyChat').val(lobbyMsgs + newLobbyMsg + '\n')
})

//Leaving the lobby
$('#leave').click(function(){
	socket.emit('leaveRoom')
	lobby.hide()
	pregame.show()
	$('#lobbyChat').val('')
	$('#msgBox').val('')
})

//Display usernames on room creation
socket.on('roomUserUpdate', function(roomUserUpdate){
    $('#roomLeader').val(roomUserUpdate)
})

//Display username on join
socket.on('roomUserUpdateOnJoin', function(roomUserUpdateOnJoin){
    $('#roomUser').val(roomUserUpdateOnJoin.user)
    var room = roomUserUpdateOnJoin.room
    $('#roomLeader').val(roomUserUpdateOnJoin.roomInfo[room].users[0])
})

//Remove user names when they leave

socket.on('userLeft', function(userLeft){
	if($('#roomLeader').val() === userLeft){
		$('#roomLeader').val('')
	}
	else{
		$('#roomUser').val('')
	}
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
