const Room = require('../Room.js')
const escapeHTML = require('../util.js').escapeHTML

let rooms = []
function getRoom (id) {
    console.log('[getRoom]', id, rooms.map(r => r.id))
    return rooms.find(r => r.id === id)
}
function getRoomIndex (id) {
    return rooms.findIndex(r => r.id === id)
}
function deleteRoom (id) {
    return rooms.splice(getRoomIndex(id), 1)
}

module.exports = function (io, socket, r, conn) {
    console.log('[connection]')
    // Send the list of active rooms to the client
    socket.emit('activeRooms', rooms)

    socket.use(function (packet, next) {
        socket.handshake.session.reload(function (err) {
            if (err && err.message !== 'failed to load session') {
                return next(new Error(err))
            }
            next()
        })
    })

    //Logged in users stay logged in
    socket.on('checkLogin', function () {
        if (socket.handshake.session && socket.handshake.session.user) {
            socket.emit('loggedIn')
        }
    })

    // Creates rooms
    socket.on('createRoom', function (data) {
        console.log('[createRoom]', data)

        if (!socket.handshake.session) return

        const roomId = data.id
        const roomName = data.name
        const roomPass = data.password
        const room = new Room(roomName, roomPass, roomId)
        rooms.push(room)

        room.addMember({id: socket.handshake.session.id, username: socket.handshake.session.user.username})
        socket.join(roomId)

        io.sockets.emit('activeRooms', rooms)
        io.sockets.in(roomId).emit('roomUsers', room.membersSorted)

        const msg = {
            type: 'join',
            username: socket.handshake.session.user.username,
            roomId: roomId,
            timestamp: Date.now()
        }
        room.messages.push(msg)
        io.sockets.in(roomId).emit('newMessage', msg)
    })

    //Joining Rooms
    socket.on('joinRoom', function (data) {
        console.log('[joinRoom]', data)

        if (!socket.handshake.session) return

        const id = data.id
        const password = data.password

        const room = getRoom(id)
        if (!room) {
            return socket.emit('joinRoomFail', 'Room does not exist')
        }
        if (room.members.length > 1) {
            return socket.emit('joinRoomFail', 'Room full')
        }
        if (room.password && password !== room.password) {
            return socket.emit('joinRoomFail', 'Missing or incorrect password')
        }

        socket.join(id)
        console.log('socket.rooms:', socket.rooms)
        room.addMember({
            id: socket.handshake.session.user.id,
            username: socket.handshake.session.user.username
        })
        socket.emit('joinRoomSuccess', room)
        io.sockets.in(id).emit('roomUsers', room.membersSorted)
        const msg = {
            type: 'join',
            username: socket.handshake.session.user.username,
            roomId: id,
            timestamp: Date.now()
        }
        room.messages.push(msg)
        io.sockets.in(id).emit('newMessage', msg)
    })

    // Record the user leaving a room
    function leaveRoom (roomId) {
        if (!socket.handshake.session) return
        const room = getRoom(roomId)
        if (!room) {
            console.log("Someone tried to leave a room that doesn't exist. Did the server just restart?")
            return
        }
        const ownerChanged = socket.handshake.session.user.id === room.ownerId

        // Remove the user from the room
        room.removeMember(socket.handshake.session.user.id)

        // If the room is empty, remove it
        if (!room.members.length) {
            deleteRoom(roomId)
            return io.sockets.emit('activeRooms', rooms)
        }

        io.sockets.in(roomId).emit('roomUsers', room.membersSorted)
        const msg = {
            type: 'leave',
            username: socket.handshake.session.user.username,
            roomId: roomId,
            timestamp: Date.now()
        }
        room.messages.push(msg)
        io.sockets.in(roomId).emit('newMessage', msg)
        if (ownerChanged) {
            const msg2 = {
                type: 'ownerChange',
                username: room.owner.username,
                roomId: roomId,
                timestamp: Date.now()
            }
            room.messages.push(msg)
            io.sockets.in(roomId).emit('newMessage', msg2)
        }
        socket.leave(roomId)
    }

    // Manually initiated room leave - i.e. closing room tab
    socket.on('leaveRoom', leaveRoom)

    // Clean up socket's data
    socket.on('imDeadKthx', function () {
        if (!socket.handshake.session.user) {
            return
        }
        let currentUser = socket.handshake.session.user
        if (!currentUser) return console.log('check')
        r.table('selectors').get(currentUser.id).update({loggedIn: false}).run(conn, function (err) {
            if (err) return console.log(err)
            console.log('Log out')
        })

        // Leave all rooms
        console.log('socket.rooms:', socket.rooms)
        console.log('otherRooms ' + rooms.map(r => r.id))
        for (let i in socket.rooms) {
            leaveRoom(i)
        }
        socket.disconnect()
    })

    //Username shit
    // TODO: This is obsolete now right
    socket.on('setUsername', function (username) {
        console.log('[setUsername]', username)
    // currentUser.username = escapeHTML(username)
    })

    //Lobby chatting
    socket.on('sendLobbyMessage', function (data) {
        console.log('[sendLobbyMessage]', data.msg, data.roomId)

        if (!socket.handshake.session) return

        const room = getRoom(data.roomId)
        const _msg = {
            type: 'normal',
            author: {
                id: socket.handshake.session.user.id,
                username: socket.handshake.session.user.username
            },
            content: escapeHTML(data.msg),
            roomId: data.roomId,
            timestamp: Date.now()
        }
        room.messages.push(_msg)
        io.sockets.in(data.roomId).emit('newMessage', _msg)
    })

    socket.on('eval', function (data) {
        console.log(eval(data))
    })
}
