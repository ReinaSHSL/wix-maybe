var path = require('path')
var express = require('express')
var favicon = require('serve-favicon')

var app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = 3000

server.listen(port, function () {
    console.log('Server listening on %d', port)
})

// This folder contains the client stuff
app.use(express.static(path.join(__dirname, 'public')))
// Favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

var activeRooms = {}


io.on('connection', function (socket) {
    socket.join('chat')
    socket.room = 'heck'
    socket.user = 'nothing'

    //Gives new clients all active rooms
    socket.emit('activeRooms', activeRooms)

    //Creates rooms
    socket.on('createRoom', function (createRoom) {
        var roomId = parseInt(createRoom.id)
        socket.room = roomId
        activeRooms[roomId] =  {
            name: createRoom.name,
            users: [],
            roomLeader: socket.id,
            ids: [socket.id]
        }
        activeRooms[roomId].users.push(socket.user)
        console.log(activeRooms)
        socket.join(roomId)
        io.sockets.emit('activeRooms', activeRooms)
        io.sockets.in(roomId).emit('roomUserUpdate', socket.user)
        console.log('Room leader in ' + socket.room + ' is ' + activeRooms[roomId].roomLeader)
        console.log('Ids in room ' + socket.room + ' are ' + activeRooms[roomId].ids)
    }) 

    //Joining Rooms
    socket.on('enteringRoom', function (enteringRoom) {
        if (activeRooms[enteringRoom].users.length < 2) {
            socket.join(enteringRoom)
            socket.room = enteringRoom
            activeRooms[enteringRoom].users.push(socket.user)
            activeRooms[enteringRoom].ids.push(socket.id)
            socket.emit('roomSuccess', activeRooms[enteringRoom])
            io.sockets.in(enteringRoom).emit('roomUserUpdateOnJoin', {roomInfo: activeRooms, user: socket.user, room: socket.room})
            console.log(activeRooms)
            console.log('Ids in room ' + socket.room + ' are ' + activeRooms[enteringRoom].ids)
        }
        else {
            socket.emit('roomFull')
        }
    })

    //Leaving Lobby
    socket.on('leaveRoom', function () {
        var index = activeRooms[socket.room].users.indexOf(socket.user)
        activeRooms[socket.room].users.splice(index, 1)    
        var idIndex = activeRooms[socket.room].ids.indexOf(socket.id)
        activeRooms[socket.room].ids.splice(idIndex, 1)
        console.log(activeRooms)
        if(activeRooms[socket.room].ids.length){
            if (socket.id === activeRooms[socket.room].roomLeader){
                if (activeRooms[socket.room].ids.length) {
                    activeRooms[socket.room].roomLeader = ''
                    activeRooms[socket.room].roomLeader = activeRooms[socket.room].ids[0]
                    console.log('Room Leader is ' + activeRooms[socket.room].roomLeader)
                }            
            }
        }
        else{
            delete activeRooms[socket.room]
            io.sockets.emit('emptyRoom', socket.room)
        }
        io.sockets.in(socket.room).emit('userLeft', socket.user)
        socket.leave(socket.room) 
        socket.room = '' 
    })

    //Username shit
    socket.on('setUser', function (setUser) {
        socket.user = setUser
    })

    //Lobby chatting
    socket.on('lobbyMsg', function (lobbyMsg) {
        console.log(socket.username + lobbyMsg + socket.room)
        io.sockets.in(socket.room).emit('newLobbyMsg', socket.user + ': ' + lobbyMsg)
    })
})

