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

var activeRooms = {}


io.on('connection', function(socket){
    socket.join('chat')
    socket.room = 'heck'
    socket.user = 'nothing'

    //Gives new clients all active rooms
    socket.emit('activeRooms', activeRooms)

    //Creates rooms
    socket.on('createRoom', function(createRoom){
        var roomId = parseInt(createRoom.id)
        socket.room = roomId
        activeRooms[roomId] =  {
            name: createRoom.name,
            users: []
        }
        activeRooms[roomId].users.push(socket.user)
        console.log(activeRooms)
        socket.join(roomId)
        io.sockets.emit('activeRooms', activeRooms)
    }) 

    //Joining Rooms
    socket.on('enteringRoom', function(enteringRoom){
        if(activeRooms[enteringRoom].users.length < 2){
            socket.join(enteringRoom)
            socket.room = enteringRoom
            activeRooms[enteringRoom].users.push(socket.user)
            socket.emit('roomSuccess', activeRooms[enteringRoom])
            console.log(activeRooms)
        }
        else{
            socket.emit('roomFull')
        }
    })

    //Leaving Lobby
    socket.on('leaveRoom', function(){
        var index = activeRooms[socket.room].users.indexOf(socket.user)
        activeRooms[socket.room].users.splice(index, 1)    
        console.log(activeRooms)
        if(activeRooms[socket.room].users.length === 0){
            delete activeRooms[socket.room]
            io.sockets.emit('emptyRoom', socket.room)
        }
        socket.leave(socket.room) 
        socket.room = '' 
    })

    //Username shit
    socket.on('setUser', function(setUser){
        socket.user = setUser
    })

    //test function, change as necessary
    socket.on('userTest', function(){
        console.log(socket.username + ' has sent a message')
    })

    //Lobby chatting
    socket.on('lobbyMsg', function(lobbyMsg){
        console.log(socket.username + lobbyMsg + socket.room)
        io.sockets.in(socket.room).emit('newLobbyMsg', socket.username + ': ' + lobbyMsg)
    })
  })

