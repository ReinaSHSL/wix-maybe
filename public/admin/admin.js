// The socket stuff is below here
var socket = io()

$('#newdb').on('click',( function () {
    var dbName = prompt('dbName?')
    socket.emit('newdb', dbName)
}))

$('#newTable').on('click',( function () {
    var tableName = prompt('tableName?')
    var dbName = prompt('dbName?')
    socket.emit('newTable', {dbName: dbName, tableName: tableName})
}))

$('#newUser').on('click',( function () {
    var tableName = prompt('tableName?')
    var newUser = prompt('Username?')
    var newPass = prompt('Password?')
    socket.emit('newUser', {newUser: newUser, newPass: newPass})
}))

$('#check').on('click', ( function () {
    socket.emit('check')
}))