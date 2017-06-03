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

// When we get a new connection, this is where we do things with it
io.sockets.on('connection', function (socket) {
  console.log('New connection! Issuing ping to client.')
  socket.emit('ping')
})
