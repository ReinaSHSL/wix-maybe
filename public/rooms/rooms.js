/* globals $, io */

var pregame = $('#pregame')
var lobby = $('#lobby')
lobby.hide()

// The socket stuff is below here
var socket = io()

//Username stuff
$('.username-form').submit(function (e) {
    e.preventDefault()
    var $input = $('.username-input')
    var $setButton = $('.set-username')
    var username = $input.val()
    if (username) {
        $input.replaceWith(`<span class="username-label" title="Click to change your username">${username}</span>`)
    } else {
        $input.replaceWith('<button class="username-label">Choose a username...</button>')
    }
    $setButton.hide()
    socket.emit('setUsername', username)
})
// $('.username-label').click(function () {
$(document).on('click', '.username-label', function () {
    console.log('test')
    var $this = $(this)
    var $setButton = $('.set-username')
    var username = $this.is('button') ? '' : $this.text()
    $this.replaceWith(`<input type="text" class="username-input" placeholder="New username" value="${username}">`)
    $setButton.show()
    $('.username-input').focus()
})

$('#testButton').click(function () {
    socket.emit('userTest')
})

//Room stuff

function timeString (timestamp) {
    return new Date(timestamp).toTimeString().substr(0, 5)
}
// HTML for a room in the room listing
function roomHTML (room) {
    return `
        <li id="${room.id}" class="activeRoom ${room.hasPassword ? 'has-password' : ''}">
            <a href="#">${room.name}</a>
        </li>
    `
}
// HTML for a message
function messageHTML (msg) {
    return `
        <tr class="message">
            <td class="timestamp">${timeString(msg.timestamp)}</td>
            <td class="author">
                <span class="hidden">&lt;</span>${msg.author.username}<span class="hidden">&gt;</span>
            </td>
            <td class="content">${msg.content}</td>
        </tr>
    `
}
function joinMessageHTML (msg) {
    return `
        <tr class="message system join">
            <td class="timestamp">${timeString(msg.timestamp)}</td>
            <td class="author">--&gt;</td>
            <td class="content">${msg.username} has joined.</td>
        </tr>
    `
}
function leaveMessageHTML (msg) {
    return `
        <tr class="message system leave">
            <td class="timestamp">${timeString(msg.timestamp)}</td>
            <td class="author">&lt;--</td>
            <td class="content">${msg.username} has left.</td>
        </tr>
    `
}
// HTML for a user in the user list
function userHTML (user) {
    console.log(user)
    return `
        <li class="user ${user.owner ? 'owner' : ''}">${user.username}</li>
    `
}

//Creates room
$('#create').click(function () {
    var roomName = $('#roomName').val()
    var roomPass = $('#roomPass').val()
    if (!roomName) {
        return alert('Please set a room name')
    } else {
        var roomId = Math.random()*1000000000000000000
        socket.emit('createRoom', {id: roomId, name: roomName, password: roomPass})
        pregame.hide()
        lobby.show()
        $('#roomList').append(roomHTML({id: roomId, name: roomName, password: roomPass}))
        $('.header .extra').text(' > Chat: ' + roomName)
    }
})

//On connection list all active rooms
socket.on('activeRooms', function (rooms) {
    console.log('[activeRooms]', rooms)
    var roomList = $('#roomList')
    roomList.empty()
    for (let room of rooms) {
        // console.log('[activeRooms]', id)
        $('#roomList').append(roomHTML(room))
    }
})

//Clicking on a room will make you join
$('#roomList').on('click', '.activeRoom', function () {
    var $this = $(this)
    var id = $this.attr('id')
    var hasPassword = $this.is('.has-password')
    if (hasPassword) {
        var password = prompt('Room password?')
        socket.emit('joinRoom', {id: id, password: password})
    } else {
        socket.emit('joinRoom', {id: id})
    }
})
socket.on('joinRoomSuccess', function (room) {
    pregame.hide()
    lobby.show()
    $('.header .extra').text(' > Chat: ' + room.name)
})
socket.on('joinRoomFail', function (reason) {
    alert(`Failed to join room: ${reason}`)
})

//Delete empty rooms
socket.on('emptyRoom', function (emptyRoom) {
    $('#' + emptyRoom).remove()
})

//Lobby stuff

//Chatbox sends msg
$('#msgBox').keydown(function (e) {
    var key = e.which
    if (key === 13) {
        var msg = $('#msgBox').val()
        socket.emit('sendLobbyMessage', msg)
        $('#msgBox').val('')
    }
})

//Display new msg
socket.on('newLobbyMessage', function (msg) {
    console.log('[newLobbyMessage]', msg)
    $('.messages').append(messageHTML(msg))
})

socket.on('newJoinMessage', function (msg) {
    console.log('[newJoinMessage]', msg)
    $('.messages').append(joinMessageHTML(msg))
})
socket.on('newLeaveMessage', function (msg) {
    console.log('[newLeaveMessage]', msg)
    $('.messages').append(leaveMessageHTML(msg))
})

//Leaving the lobby
$('#leave').click(function () {
    socket.emit('leaveRoom')
    lobby.hide()
    pregame.show()
    $('.messages').empty()
    $('#msgBox').val('')
    $('.header .extra').text('')
})

//Display usernames on room creation
socket.on('roomUsers', function (users) {
    console.log('[roomUsers]', users)
    users.sort((u1, u2) => {
        if (u1.owner && !u2.owner) return -1
        if (u2.owner && !u1.owner) return 1
        return u1.username.localeCompare(u2.username)
    })
    var $userList = $('.users')
    $userList.empty()
    for (let user of users) {
        $userList.append(userHTML(user))
    }
})

// Remove the user from the room when they reload or exit the page
window.onbeforeunload = function () {
    socket.emit('leaveRoom')
}


// Console utility - leave this here
function doEval (text) { // eslint-disable-line no-unused-vars
    socket.emit('eval', text)
}
socket.on('console', console.log)
