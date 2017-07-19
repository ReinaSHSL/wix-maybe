$('.loggedIn').hide()

// The socket stuff is below here
var socket = io()

$('#login').click(function () {
    var username = $('#username').val()
    var pass = $('#pass').val()
    var hash = 5381
    for (i = 0; i < pass.length; i++) {
        char = pass.charCodeAt(i)
        hash = ((hash << 5) + hash) + char /* hash * 33 + c */
    }
    socket.emit('login', {username: username, password: hash})	
})

$('#register').click(function () {
    var username = $('#rUsername').val()
    var pass = $('#rPass').val()
    var hash = 5381
    for (i = 0; i < pass.length; i++) {
        char = pass.charCodeAt(i)
        hash = ((hash << 5) + hash) + char /* hash * 33 + c */
    }
    socket.emit('register', {username: username, password: hash})
})

socket.on('incorrect', function () {
    alert('Incorrect username or password')
})

socket.on('loggedIn', function () {
    $('.loggedIn').show()
})