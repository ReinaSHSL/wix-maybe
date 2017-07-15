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

var activeRooms = {ids:[], names: [], users: []}

io.on('connection', function(socket){
    socket.join('chat')
    socket.room = 'heck'
    socket.user = 'nothing'

    //Gives new clients all active rooms
    socket.emit('activeRooms', activeRooms)

    //Creates rooms
    socket.on('createRoom', function(createRoom){
        var roomId = parseInt(createRoom.id)
        activeRooms.ids.push(roomId)
        activeRooms.names.push(createRoom.name)
        activeRooms.users.push(roomId)
        socket.join(roomId)
        socket.room = roomId
        io.sockets.emit('activeRooms', activeRooms)
    }) 


    //Joining Rooms
    socket.on('enteringRoom', function(enteringRoom){
        var userCheck = 0
        var roomUsers = parseInt(enteringRoom)
        for(var i=0; i<activeRooms.users.length; i++){
            if(activeRooms.users[i] === roomUsers){
                userCheck++
            }
        }
        if(userCheck < 2){
            socket.join(enteringRoom)
            socket.room = enteringRoom
            var user = parseInt(enteringRoom)
            activeRooms.users.push(user)
            socket.emit('roomSuccess', {id: enteringRoom, userCheck: userCheck})
        }
        else{
            socket.emit('roomFull', userCheck)
        }
    })

    //Username shit
    socket.on('setUser', function(setUser){
        socket.username = setUser
    })

    //test function
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
        var index = activeRooms.users.indexOf(socket.room)
        activeRooms.users.splice(index, 1)
        socket.leave(socket.room)
    })
  })

