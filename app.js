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

//Creating Rooms
io.on('connection', function(socket){
    socket.on('createRoom', function(roomId){
	console.log(roomId)
	socket.join(roomId)
    socket.on('giveId', function(){
        socket.emit('confirmJoin', roomId)
    })
  })
})    