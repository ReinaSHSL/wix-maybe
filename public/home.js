/* globals $, io */

$('.loggedIn').hide()

// The socket stuff is below here
var socket = io()

$('#login').click(function () {
    var username = $('#username').val()
    var pass = $('#pass').val()
    var hash = 5381
    for (var i = 0; i < pass.length; i++) {
        var char = pass.charCodeAt(i)
        hash = ((hash << 5) + hash) + char /* hash * 33 + c */
    }
    socket.emit('login', {username: username, password: hash})
})

$('#register').click(function () {
    var username = $('#rUsername').val()
    var pass = $('#rPass').val()
    var hash = 5381
    for (var i = 0; i < pass.length; i++) {
        var char = pass.charCodeAt(i)
        hash = ((hash << 5) + hash) + char /* hash * 33 + c */
    }
    socket.emit('register', {username: username, password: hash})
})

socket.on('loginFail', function (reason) {
    alert('Failed to log in: ' + reason)
})

socket.on('loginSuccess', function () {
    $('.loggedIn').show()
})
