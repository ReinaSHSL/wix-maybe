/* globals $, socket, hashColor */

const $lobby = $('.lobby')
const $roomsView = $lobby.find('.rooms')
const $chatView = $lobby.find('.chat')
const $tabBar = $lobby.find('.tabs')

// Tab stuff
$tabBar.on('click', '.tab-rooms', function () {
    $chatView.hide()
    $roomsView.show()
})
$tabBar.on('click', '.tab-chat', function () {
    const $tab = $(this)
    $roomsView.hide()
    $chatView.show()
    // TODO: load proper room based on data stored on button
})

$chatView.hide()

// Scroll the chat box to the bottom, the most recent messages.
function scrollChat () {
    const $el = $('.lobby .messages')
    $el.scrollTop($el[0].scrollHeight)
}

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
    msg.content = msg.content
        .replace(/([^\\]|^)(__|\*\*)(?=[^\s\n])([^\n]*[^\s\\\n])\2/g, '$1<strong>$3</strong>')
        .replace(/([^\\]|^)(_|\*)(?=[^\s\n])([^\n]*[^\s\\\n])\2/g, '$1<em>$3</em>')
        .replace(/([^\\]|^)(~~)(?=[^\s\n])([^\n]*[^\s\\\n])\2/g, '$1<del>$3</del>')
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
function roomTabHTML (room) {
    console.log(room)
    return `
        <a href="#" class="tab tab-chat">${room.name}</a>
    `
}

//Creates room
$('.rooms .create').click(function () {
    console.log('test?')
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
    // Hide the rooms list and show the message interface
    $roomsView.hide()
    $chatView.show()
    // Show us which room we're in
    $('.header .extra').text(' > Chat: ' + room.name)
    // Add the backlog messages to the interface
    for (let msg of room.messages) {
        processMessage(msg)
    }
    // Scroll the chat down to the most recent message
    scrollChat()
    // Also, let's update the tab bar with a new tab for the room
    $tabBar.append(roomTabHTML(room))
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
function processMessage (msg) {
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
    const $messages = $('.messages')
    // Are we looking at the bottom of the chat right now? (this check must be
    // before we add the message)
    const isScrolled = $messages.scrollTop() + $messages.innerHeight() >= $messages[0].scrollHeight
    // Add the message to the interface
    processMessage(msg)
    // If we were at the bottom before, put us back at the bottom
    if (isScrolled) {
        scrollChat()
    }
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
