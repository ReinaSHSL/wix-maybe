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

    // Creates rooms
    socket.on('createRoom', function (data) {
        console.log('[createRoom]', data)

        if (!socket.handshake.session) return

        const roomId = `${Math.floor(Date.now())}-${Math.floor(Math.random()*1000)}`
        const roomName = data.name
        console.log(data.name)
        const roomPass = data.password
        const room = new Room(roomName, roomPass, roomId)
        rooms.push(room)
        console.log(room.name)

        room.addMember(socket.handshake.session.user)
        socket.join(roomId)
        r.table('decks').filter(r.row('owner').eq(socket.handshake.session.user.id)).run(conn, function (err, cursor) {
            if (err) return console.log (err)
            cursor.toArray(function (err, result) {
                if (err) return console.log(err)
                for (let deck of result) {
                    socket.emit('roomDecks', deck)
                }
            })
        })
        socket.emit('joinRoomSuccess', room.withMessages())
        io.sockets.emit('activeRooms', rooms)
        io.sockets.in(roomId).emit('roomUsers', roomId, room.memberList)

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
        if (room.members.find(u => u.id === socket.handshake.session.user.id)) {
            return socket.emit('joinRoomFail', 'You are already in this room')
        }
        if (room.members.length > 1) {
            return socket.emit('joinRoomFail', 'Room full')
        }
        if (room.password && password !== room.password) {
            return socket.emit('joinRoomFail', 'Missing or incorrect password')
        }
        r.table('decks').filter(r.row('owner').eq(socket.handshake.session.user.id)).run(conn, function (err, cursor) {
            if (err) return console.log (err)
            cursor.toArray(function (err, result) {
                if (err) return console.log(err)
                for (let deck of result) {
                    socket.emit('roomDecks', deck)
                }
            })
        })
        socket.join(id)
        room.addMember({
            id: socket.handshake.session.user.id,
            username: socket.handshake.session.user.username
        })

        socket.emit('joinRoomSuccess', room.withMessages())
        io.sockets.in(id).emit('roomUsers', id, room.memberList)
        const msg = {
            type: 'join',
            username: socket.handshake.session.user.username,
            roomId: id,
            timestamp: Date.now()
        }
        io.sockets.emit('activeRooms', rooms)
        room.messages.push(msg)
        io.sockets.in(id).emit('newMessage', msg)
    })

    // User sends ready
    socket.on('deckInRoom', function (roomId, deckId) {
        console.log('[deckInRoom', roomId, deckId)
        if (!socket.handshake.session) return
        const room = getRoom(roomId)
        if (!room) return

        const userId = socket.handshake.session.user.id
        const userIndex = room.members.findIndex(u => u.id === userId)

        if (!deckId) {
            room.memberDeck(userId, null)
            io.sockets.in('roomId').emit('roomUsers', roomId, room.memberList)
            return
        }
        r.table('decks').filter(r.row('owner').eq(userId)).filter(r.row('id').eq(deckId)).run(conn, function (err, value) {
            if (err) return console.log(err)
            value.toArray(function (err, decks) {
                if (err) return console.log(err)
                if (!decks.length) return console.log('Deck not found')
                console.log(decks[0])
                room.memberDeck(userId, decks[0])
                io.sockets.in(roomId).emit('roomUsers', roomId, room.memberList)
            })
        })
    })
    //Unready
    socket.on('unReady', function(roomId) {
        if (!socket.handshake.session) return
        const room = getRoom(roomId)
        if (!room) return
        const userId = socket.handshake.session.user.id
        const userIndex = room.members.findIndex(u => u.id === userId)
        room.members[userIndex].ready = false
        io.sockets.in(roomId).emit('roomUsers', roomId, room.memberList)
        console.log(room.members[userIndex].ready)
    })

    // Record the user leaving a room
    function leaveRoom (roomId) {
        if (!socket.handshake.session) return
        const room = getRoom(roomId)
        if (!room) return

        const ownerChanged = socket.handshake.session.user.id === room.ownerId

        // Remove the user from the room
        room.removeMember(socket.handshake.session.user.id)
        socket.leave(roomId)

        // If the room is empty, remove it
        if (!room.members.length) {
            deleteRoom(roomId)
            return io.sockets.emit('activeRooms', rooms)
        }

        io.sockets.in(roomId).emit('roomUsers', roomId, room.memberList)
        const msg = {
            type: 'leave',
            username: socket.handshake.session.user.username,
            roomId: roomId,
            timestamp: Date.now()
        }
        room.messages.push(msg)
        io.sockets.in(roomId).emit('newMessage', msg)
        io.sockets.emit('activeRooms', rooms)
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
    }

    // Manually initiated room leave - i.e. closing room tab
    socket.on('leaveRoom', leaveRoom)

    // Clean up socket's data
    socket.on('disconnect', function () {
        let currentUser = socket.handshake.session.user
        if (!currentUser) return // If they weren't logged in, nothing to do
        console.log('[disconnection]', currentUser)

        // Log user out
        r.table('selectors').get(currentUser.id).update({loggedIn: false}).run(conn, function (err) {
            if (err) return console.log(err)
            console.log('Log out')
        })

        // Leave all rooms
        const roomsUserWasIn = rooms.filter(r => r.members.find(m => m.id === currentUser.id))
        for (let room of roomsUserWasIn) {
            leaveRoom(room.id)
        }
    })

    // Room chatting
    socket.on('sendRoomMessage', function (data) {
        console.log('[sendRoomMessage]', data.roomId, data.msg)

        if (!socket.handshake.session) return

        const room = getRoom(data.roomId)
        const _msg = {
            type: 'normal',
            author: {
                id: socket.handshake.session.user.id,
                username: socket.handshake.session.user.username
            },
            content: data.msg.replace(/^\s+|\s+$/g, ''),
            roomId: data.roomId,
            timestamp: Date.now()
        }
        if (!_msg.content) return // No empty messages
        room.messages.push(_msg)
        io.sockets.in(data.roomId).emit('newMessage', _msg)
    })

    socket.on('eval', function (data) {
        console.log(eval(data))
    })
}
