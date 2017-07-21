/* globals $, socket, hashColor */

const $lobby = $('.lobby')
const $roomsView = $('.lobby .panel-content .rooms')
const $chatView = $('.lobby .panel-content .chat')
const $tabBar = $('.lobby .panel-tabs')

// Tab stuff
$tabBar.on('click', '.rooms', function () {
    $chatView.hide()
    $roomsView.show()
})
$tabBar.on('click', '.chat', function () {
    const $tab = $(this)
    $roomsView.hide()
    $chatView.show()
    // TODO: load proper room based on data stored on button
})

$chatView.hide()
$tabBar.hide()

function timeString (timestamp) {
    return new Date(timestamp).toTimeString().substr(0, 5)
}
function usernameHTML (username) {
    return `
        <span class="username" style="color:${hashColor(username)}">${username}</span>
    `
}
function roomHTML (room) {
    return `
        <li id="${room.id}" class="activeRoom ${room.hasPassword ? 'has-password' : ''}">
            <a href="#">${room.name}</a>
        </li>
    `
}
function messageHTML (msg) {
    return `
        <tr class="message">
            <td class="timestamp">${timeString(msg.timestamp)}</td>
            <td class="author">
                <span class="hidden">&lt;</span>${usernameHTML(msg.author.username)}<span class="hidden">&gt;</span>
            </td>
            <td class="content">${msg.content}</td>
        </tr>
    `
}
function systemMessageHTML (msg) {
    return `
        <tr class="message system ${msg.classes && msg.classes.join(' ')}">
            <td class="timestamp">${timeString(msg.timestamp)}</td>
            <td class="author">${msg.author}</td>
            <td class="content">${msg.content}</td>
        </tr>
    `
}
function joinMessageHTML (msg) {
    return systemMessageHTML({
        classes: ['join', 'muted'],
        author: '-->',
        content: `${usernameHTML(msg.username)} has joined.`,
        timestamp: msg.timestamp
    })
}
function leaveMessageHTML (msg) {
    return systemMessageHTML({
        classes: ['leave', 'muted'],
        author: '<--',
        content: `${usernameHTML(msg.username)} has left.`,
        timestamp: msg.timestamp
    })
}
function ownerChangeMessageHTML (msg) {
    return `
        <tr class="message system">
            <td class="timestamp">${timeString(msg.timestamp)}</td>
            <td class="author">---</td>
            <td class="content">${usernameHTML(msg.username)} is now the owner.</td>
        </tr>
    `
}
function userHTML (user) {
    return `
        <li class="user ${user.owner ? 'owner' : ''}">${usernameHTML(user.username)}</li>
    `
}

//Creates room
$('.rooms .create').click(function () {
    var roomName = $('#roomName').val()
    var roomPass = $('#roomPass').val()
    if (!roomName) {
        return alert('Please set a room name')
    } else {
        var roomId = Math.random()*1000000000000000000
        socket.emit('createRoom', {id: roomId, name: roomName, password: roomPass})
        $roomsView.hide()
        $chatView.show()
        $('#roomList').append(roomHTML({id: roomId, name: roomName, password: roomPass}))
        $('.header .extra').text(' > Chat: ' + roomName)
    }
})

//On connection list all active rooms
socket.on('activeRooms', function (rooms) {
    console.log('[activeRooms]', rooms)
    const $roomList = $('.lobby .roomList')
    $roomList.empty()
    for (let room of rooms) {
        // console.log('[activeRooms]', id)
        $roomList.append(roomHTML(room))
    }
})

//Clicking on a room will make you join
$('.rooms .roomList').on('click', '.activeRoom', function () {
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
    $roomsView.hide()
    $chatView.show()
    $('.header .extra').text(' > Chat: ' + room.name)
    for (let msg of room.messages) {
        shit(msg)
    }
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
function shit (msg) {
    let html
    switch (msg.type) {
        case 'normal':
            html = messageHTML(msg)
            break
        case 'join':
            html = joinMessageHTML(msg)
            break
        case 'leave':
            html = leaveMessageHTML(msg)
            break
        case 'ownerChange':
            html = ownerChangeMessageHTML(msg)
            break
        default:
            return console.log('Invalid message type')
    }
    $('.messages').append(html)
}
//Display new msg
socket.on('newMessage', function (msg) {
    console.log('[newMessage]', msg)
    shit(msg)
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
    $chatView.hide()
    $roomsView.show()
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
