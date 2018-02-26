/* globals $, socket, hashColor */

const $roomsPanel = $('.rooms')
const $roomsList = $roomsPanel.find('.rooms-list')
const $tabBar = $roomsPanel.find('.tabs')
const $roomsListTab = $tabBar.find('.tab-rooms')

// Tab stuff
function showRooms () {
    $tabBar.find('.tab').toggleClass('active', false)
    $roomsListTab.toggleClass('active', true)
    $roomsPanel.find('.room').hide()
    $roomsList.show()
}
$roomsListTab.click(showRooms)
function showChat (roomId, $tab = $tabBar.find(`[data-room-id="${roomId}"]`)) {
    $roomsList.hide()
    $roomsPanel.find('.room').hide()
    $roomsPanel.find(`.room[data-room-id="${roomId}"]`).show()
    $tabBar.find('.tab').toggleClass('active', false)
    $tab.toggleClass('active', true)
}
$tabBar.on('click', '.tab-chat', function () {
    const $tab = $(this)
    showChat($tab.attr('data-room-id'), $tab)
})

// Scroll the chat box to the bottom, the most recent messages.
function scrollChat () {
    const $el = $('.rooms .messages')
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
            <a href="#">
                <span class="name">${room.safeName}
                ${room.hasPassword ? '<span class="info has-password">Has password</span>' : ''}
                <span class="info members">${room.members.length} member${room.members.length === 1 ? '' : 's'}</span>
            </a>
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
            <td class="author">${usernameHTML(msg.author.username)}</td>
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
        author: '--&gt;',
        content: `${usernameHTML(msg.username)} has joined.`,
        timestamp: msg.timestamp
    })
}
function leaveMessageHTML (msg) {
    return systemMessageHTML({
        classes: ['leave', 'muted'],
        author: '&lt;--',
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
        <li class="user ${user.owner ? 'owner' : ''} ${user.ready ? 'ready' : ''}"> ${usernameHTML(user.username)} ${user.ready ? '^' : ''}</li>
    `
}
function roomTabHTML (room) {
    return `
        <a href="#" class="tab tab-chat" data-room-id="${room.id}">
            <span class="tab-title">${room.safeName}</span>
            <button class="tab-close" title="Leave room">Leave room</button>
        </a>
    `
}
function roomDisplayHTML (room) {
    return `
        <div class="room" data-room-id="${room.id}">
            <table class="messages"></table>
            <ul class="users"></ul>
            <input type="text" class="chatbar msgBox" placeholder="Type text here">
            <select class="deckSelect">
                <option disabled selected>Choose a deck...</option>
            </select>
            <label class="readyButton" for="readyInput">
                <input type="checkbox" id="readyInput" class="readyInput">
                Ready?
            </label>
        </div>
    `
}

//Creates room
$('.rooms .create').click(function () {
    var roomName = $('#roomName').val()
    var roomPass = $('#roomPass').val()
    if (!roomName) {
        return alert('Please set a room name')
    } else {
        const room = {
            name: roomName,
            password: roomPass
        }
        socket.emit('createRoom', room)
    }
    $('.deckSelect option').remove();
})

socket.on('roomCreated', function (room) {
    console.log('[roomCreated]', room)
    // TODO: let activeRooms handle this
    $('#roomList').append(roomHTML(room))
    // Let's see the new room
    $roomsList.hide()
    $roomsPanel.find('.room').hide()
    $roomsPanel.append(roomDisplayHTML(room))
    // Also tabs, right
    $tabBar.find('.tab').toggleClass('active', false)
    $tabBar.append(roomTabHTML(room))
    $tabBar.find('.tab:last-child').toggleClass('active', true)
    // Since you own this room, replace the "Ready" button with a "Start" button
    $('')
})

socket.on('roomDecks', function(deck) {
    $('.deckSelect').append('<option value="' + deck.id + '">' + deck.name + '</option>')
})

//On connection list all active rooms
socket.on('activeRooms', function (rooms) {
    console.log('[activeRooms]', rooms)
    const $roomList = $('.roomsListUl')
    $roomList.empty()
    for (let room of rooms) {
        // console.log('[activeRooms]', id)
        $roomList.append(roomHTML(room))
    }
    if (!rooms.length) {
        $roomList.append('<li>There are no rooms!?</li>')
    }
})

//Clicking on a room will make you join
$('.rooms .roomsListUl').on('click', '.activeRoom', function () {
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
    // Add a new tab for this room
    $('.deckSelect option').remove();
    $tabBar.find('.tab').toggleClass('active', false)
    $tabBar.append(roomTabHTML(room))
    $tabBar.find('.tab:last-child').toggleClass('active', true)
    // Add a new room display for this room
    $roomsList.hide()
    $roomsPanel.find('.room').hide()
    $roomsPanel.append(roomDisplayHTML(room))
    // Add the backlog messages to the interface
    for (let msg of room.messages) {
        processMessage(msg)
    }
    // Scroll the chat down to the most recent message
    scrollChat()
})
socket.on('joinRoomFail', function (reason) {
    alert(`Failed to join room: ${reason}`)
})

// Delete empty rooms
// socket.on('emptyRoom', function (emptyRoom) {
//     $('#' + emptyRoom).remove()
//     if (!$('.roomsListUl').find('li').length) {
//         $('.roomsListUl').append('<li>There are no rooms!?</li>')
//     }
// })

// Room stuff

// Chatbox sends msg
$('.rooms').on('keydown', '.msgBox', function (e) {
    var key = e.which
    if (key === 13) {
        let roomId = $('.tab.active').attr('data-room-id')
        console.log(roomId)
        var msg = $(this).val()
        socket.emit('sendRoomMessage', {msg: msg, roomId: roomId})
        $(this).val('')
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
    $(`.room[data-room-id="${msg.roomId}"] .messages`).append(html)
}

//Display new msg
socket.on('newMessage', function (msg) {
    console.log('[newMessage]', msg)
    // Are we looking at the bottom of the chat right now? (this check must be
    // before we add the message)
    const isScrolled = true // TODO: issue #13
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

// Ready on room
$roomsPanel.on('change', '.readyInput', function () {
    const $this = $(this)
    const roomId = $this.closest('.room').attr('data-room-id')
    if ($this.is(':checked')) {
        const deckId = $this.closest('.room').find('.deckSelect').val()
        socket.emit('deckInRoom', roomId, deckId)
         $('.deckSelect').prop('disabled', true)
    }
    if (!$this.is(':checked')) {
        $('.deckSelect').prop('disabled', false)
    }
})

//Leaving the room
$tabBar.on('click', '.tab-close', function (e) {
    e.stopPropagation()
    const $this = $(this)
    const $tab = $this.closest('.tab')
    const roomId = $tab.attr('data-room-id')
    socket.emit('leaveRoom', roomId)
    showRooms()
    $tab.remove()
    $roomsPanel.find(`.room[data-room-id="${roomId}"]`).remove()
})

//Display usernames on room creation
socket.on('roomUsers', function (roomId, users) {
    console.log('[roomUsers]', roomId, users)
    users = users.sort((u1, u2) => {
        if (u1.owner && !u2.owner) return -1
        if (u2.owner && !u1.owner) return 1
        return u1.username.localeCompare(u2.username)
    })
    var $userList = $(`.room[data-room-id="${roomId}"] .users`)
    $userList.empty()
    for (let user of users) {
        $userList.append(userHTML(user))
    }
})

// Remove the user from the room when they reload or exit the page
window.onbeforeunload = function () {
    socket.emit('imDeadKthx')
}
