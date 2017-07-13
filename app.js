var path = require('path');
var express = require('express');
var favicon = require('serve-favicon')

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000

server.listen(port, function () {
  console.log('Server listening on %d', port)
})

// This folder contains the client stuff
app.use(express.static(path.join(__dirname, 'public')));
// Favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

var activeRooms = []
io.on('connection', function(socket){
    socket.join('chat')
    socket.room = 'heck'
    socket.user = 'nothing'
    io.sockets.in('chat').emit('message', 'whatup')

    //Gives new clients all active rooms
    socket.emit('activeRooms', activeRooms) 

    //Joining Rooms
    socket.on('enteringRoom', function(enteringRoom){
        console.log(enteringRoom)
        socket.join(enteringRoom)
        socket.room = enteringRoom
        io.sockets.in(enteringRoom).emit('newClient', enteringRoom)
    })

    //Creates rooms
    socket.on('createRoom', function(createRoom){
	    console.log(createRoom)
	    socket.join(createRoom)
        activeRooms.push(createRoom)
        socket.room = createRoom
        socket.broadcast.emit('newRoom', createRoom)
    })

    socket.on('setUser', function(setUser){
        socket.username = setUser
    })

    socket.on('userTest', function(){
        console.log(socket.username + ' has sent a message')
    })

    //Lobby chatting
    socket.on('lobbyMsg', function(lobbyMsg){
        console.log(socket.username + lobbyMsg + socket.room)
        io.sockets.in(socket.room).emit('newLobbyMsg', socket.username + ': ' + lobbyMsg)
    })

    //Leaving Lobby
    socket.on('leaveRoom', function(){
        socket.leave(socket.room)
    })
  })

