/* globals $, io, MD5 */

var pregame = $('#pregame')
var lobby = $('#lobby')
lobby.hide()

// warning stolen property
// https://github.com/Zarel/Pokemon-Showdown-Client/blob/1e8340c850fb39abae280cf85bee31d6dbd9e3d7/js/battledata.js#L59-L114
/* eslint-disable */

window.MD5=function(f){function i(b,c){var d,e,f,g,h;f=b&2147483648;g=c&2147483648;d=b&1073741824;e=c&1073741824;h=(b&1073741823)+(c&1073741823);return d&e?h^2147483648^f^g:d|e?h&1073741824?h^3221225472^f^g:h^1073741824^f^g:h^f^g}function j(b,c,d,e,f,g,h){b=i(b,i(i(c&d|~c&e,f),h));return i(b<<g|b>>>32-g,c)}function k(b,c,d,e,f,g,h){b=i(b,i(i(c&e|d&~e,f),h));return i(b<<g|b>>>32-g,c)}function l(b,c,e,d,f,g,h){b=i(b,i(i(c^e^d,f),h));return i(b<<g|b>>>32-g,c)}function m(b,c,e,d,f,g,h){b=i(b,i(i(e^(c|~d),
f),h));return i(b<<g|b>>>32-g,c)}function n(b){var c="",e="",d;for(d=0;d<=3;d++)e=b>>>d*8&255,e="0"+e.toString(16),c+=e.substr(e.length-2,2);return c}var g=[],o,p,q,r,b,c,d,e,f=function(b){for(var b=b.replace(/\r\n/g,"\n"),c="",e=0;e<b.length;e++){var d=b.charCodeAt(e);d<128?c+=String.fromCharCode(d):(d>127&&d<2048?c+=String.fromCharCode(d>>6|192):(c+=String.fromCharCode(d>>12|224),c+=String.fromCharCode(d>>6&63|128)),c+=String.fromCharCode(d&63|128))}return c}(f),g=function(b){var c,d=b.length;c=
d+8;for(var e=((c-c%64)/64+1)*16,f=Array(e-1),g=0,h=0;h<d;)c=(h-h%4)/4,g=h%4*8,f[c]|=b.charCodeAt(h)<<g,h++;f[(h-h%4)/4]|=128<<h%4*8;f[e-2]=d<<3;f[e-1]=d>>>29;return f}(f);b=1732584193;c=4023233417;d=2562383102;e=271733878;for(f=0;f<g.length;f+=16)o=b,p=c,q=d,r=e,b=j(b,c,d,e,g[f+0],7,3614090360),e=j(e,b,c,d,g[f+1],12,3905402710),d=j(d,e,b,c,g[f+2],17,606105819),c=j(c,d,e,b,g[f+3],22,3250441966),b=j(b,c,d,e,g[f+4],7,4118548399),e=j(e,b,c,d,g[f+5],12,1200080426),d=j(d,e,b,c,g[f+6],17,2821735955),c=
j(c,d,e,b,g[f+7],22,4249261313),b=j(b,c,d,e,g[f+8],7,1770035416),e=j(e,b,c,d,g[f+9],12,2336552879),d=j(d,e,b,c,g[f+10],17,4294925233),c=j(c,d,e,b,g[f+11],22,2304563134),b=j(b,c,d,e,g[f+12],7,1804603682),e=j(e,b,c,d,g[f+13],12,4254626195),d=j(d,e,b,c,g[f+14],17,2792965006),c=j(c,d,e,b,g[f+15],22,1236535329),b=k(b,c,d,e,g[f+1],5,4129170786),e=k(e,b,c,d,g[f+6],9,3225465664),d=k(d,e,b,c,g[f+11],14,643717713),c=k(c,d,e,b,g[f+0],20,3921069994),b=k(b,c,d,e,g[f+5],5,3593408605),e=k(e,b,c,d,g[f+10],9,38016083),
d=k(d,e,b,c,g[f+15],14,3634488961),c=k(c,d,e,b,g[f+4],20,3889429448),b=k(b,c,d,e,g[f+9],5,568446438),e=k(e,b,c,d,g[f+14],9,3275163606),d=k(d,e,b,c,g[f+3],14,4107603335),c=k(c,d,e,b,g[f+8],20,1163531501),b=k(b,c,d,e,g[f+13],5,2850285829),e=k(e,b,c,d,g[f+2],9,4243563512),d=k(d,e,b,c,g[f+7],14,1735328473),c=k(c,d,e,b,g[f+12],20,2368359562),b=l(b,c,d,e,g[f+5],4,4294588738),e=l(e,b,c,d,g[f+8],11,2272392833),d=l(d,e,b,c,g[f+11],16,1839030562),c=l(c,d,e,b,g[f+14],23,4259657740),b=l(b,c,d,e,g[f+1],4,2763975236),
e=l(e,b,c,d,g[f+4],11,1272893353),d=l(d,e,b,c,g[f+7],16,4139469664),c=l(c,d,e,b,g[f+10],23,3200236656),b=l(b,c,d,e,g[f+13],4,681279174),e=l(e,b,c,d,g[f+0],11,3936430074),d=l(d,e,b,c,g[f+3],16,3572445317),c=l(c,d,e,b,g[f+6],23,76029189),b=l(b,c,d,e,g[f+9],4,3654602809),e=l(e,b,c,d,g[f+12],11,3873151461),d=l(d,e,b,c,g[f+15],16,530742520),c=l(c,d,e,b,g[f+2],23,3299628645),b=m(b,c,d,e,g[f+0],6,4096336452),e=m(e,b,c,d,g[f+7],10,1126891415),d=m(d,e,b,c,g[f+14],15,2878612391),c=m(c,d,e,b,g[f+5],21,4237533241),
b=m(b,c,d,e,g[f+12],6,1700485571),e=m(e,b,c,d,g[f+3],10,2399980690),d=m(d,e,b,c,g[f+10],15,4293915773),c=m(c,d,e,b,g[f+1],21,2240044497),b=m(b,c,d,e,g[f+8],6,1873313359),e=m(e,b,c,d,g[f+15],10,4264355552),d=m(d,e,b,c,g[f+6],15,2734768916),c=m(c,d,e,b,g[f+13],21,1309151649),b=m(b,c,d,e,g[f+4],6,4149444226),e=m(e,b,c,d,g[f+11],10,3174756917),d=m(d,e,b,c,g[f+2],15,718787259),c=m(c,d,e,b,g[f+9],21,3951481745),b=i(b,o),c=i(c,p),d=i(d,q),e=i(e,r);return(n(b)+n(c)+n(d)+n(e)).toLowerCase()};

/* eslint-enable */

function hashColor (name) {
    var hash = MD5(name)
    var H = parseInt(hash.substr(4, 4), 16) % 360 // 0 to 360
    var S = parseInt(hash.substr(0, 4), 16) % 50 + 40 // 40 to 89
    var L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30) // 30 to 49

    var C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100
    var X = C * (1 - Math.abs((H / 60) % 2 - 1))
    var m = L / 100 - C / 2

    var R1, G1, B1
    switch (Math.floor(H / 60)) {
        case 1: R1 = X; G1 = C; B1 = 0; break
        case 2: R1 = 0; G1 = C; B1 = X; break
        case 3: R1 = 0; G1 = X; B1 = C; break
        case 4: R1 = X; G1 = 0; B1 = C; break
        case 5: R1 = C; G1 = 0; B1 = X; break
        case 0: default: R1 = C; G1 = X; B1 = 0; break
    }
    var lum = (R1 + m) * 0.2126 + (G1 + m) * 0.7152 + (B1 + m) * 0.0722 // 0.05 (dark blue) to 0.93 (yellow)

    var HLmod = (lum - 0.5) * -100 // -43 (yellow) to 45 (dark blue)
    if (HLmod > 12) HLmod -= 12
    else if (HLmod < -10) HLmod = (HLmod + 10) * 2 / 3
    else HLmod = 0

    L += HLmod

    var Smod = 10 - Math.abs(50 - L)
    if (HLmod > 15) Smod += (HLmod - 15) / 2
    S -= Smod

    return 'hsl(' + H + ',' + S + '%,' + L + '%);'
}

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
function usernameHTML (username) {
    return `
        <span class="username" style="color:${hashColor(username)}">${username}</span>
    `
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
            <td class="content">${msg.contentHTML || msg.content}</td>
        </tr>
    `
}
function joinMessageHTML (msg) {
    return `
        <tr class="message system join">
            <td class="timestamp">${timeString(msg.timestamp)}</td>
            <td class="author">--&gt;</td>
            <td class="content">${usernameHTML(msg.username)} has joined.</td>
        </tr>
    `
}
function leaveMessageHTML (msg) {
    return `
        <tr class="message system leave">
            <td class="timestamp">${timeString(msg.timestamp)}</td>
            <td class="author">&lt;--</td>
            <td class="content">${usernameHTML(msg.username)} has left.</td>
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
