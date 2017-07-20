/* globals $, io */

$('.loggedIn').hide()

// The socket stuff is below here
var socket = io()

// Hash function
function hash (pass) {
    var hash = 5381
    for (var i = 0; i < pass.length; i++) {
        var char = pass.charCodeAt(i)
        hash = ((hash << 5) + hash) + char /* hash * 33 + c */
    }
}

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
    var password = $('#rPass').val()
    var hashed = hash(password)
    socket.emit('register', {username: username, password: hashed})
})

socket.on('loginFail', function (reason) {
    console.log('[loginFail]', reason)
    alert('Failed to log in: ' + reason)
})

socket.on('loginSuccess', function (user) {
    console.log('[loginSuccess]', user)
    $('.loggedIn').show()
})

socket.on('registerFail', function (reason) {
    console.log('[registerFail]', reason)
    alert('Failed to register: ' + reason)
})

socket.on('registerSuccess', function (user) {
    console.log('[registerSuccess]', user)
    alert('Registered! Please log in.')
})
