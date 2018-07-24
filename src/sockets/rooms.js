const Collection = require('../structures/Collection.js')
const Room = require('../structures/Room.js')
const escapeHTML = require('../util.js').escapeHTML

let rooms = new Collection(Room)

module.exports = function (io, socket, r, conn) {
	console.log('[connection]')

	socket.use(function (packet, next) {
		socket.handshake.session.reload(function (err) {
			if (err && err.message !== 'failed to load session') {
				return next(new Error(err))
			}
			next()
		})
	})

	// When the client requests the active rooms, send them
	socket.on('getActiveRooms', (data, cb) => {
		cb(rooms)
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
		rooms.add(room)
		console.log(room.name)

		room.addMember(socket.handshake.session.user)
		socket.join(roomId)
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

		const room = rooms.get(id)
		if (!room) {
			return socket.emit('joinRoomFail', 'Room does not exist')
		}
		if (room.members.find(u => u.id === socket.handshake.session.user.id)) {
			return socket.emit('joinRoomFail', 'You are already in this room')
		}
		// if (room.members.length > 1) {
		// 	return socket.emit('joinRoomFail', 'Room full')
		// }
		if (room.password && password !== room.password) {
			return socket.emit('joinRoomFail', 'Missing or incorrect password')
		}
		if (!socket.handshake.session.user) return console.log("user isn't defined aaaa")
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

	//Start Game
	socket.on('startGame', function (roomId, deckId) {
		if (!socket.handshake.session) return
		const room = rooms.get(roomId)
		if (!room) return
		const userId = socket.handshake.session.user.id
		if (!deckId) {
			console.log('uwu')
			return
		}
		r.table('decks').filter(r.row('owner').eq(userId)).filter(r.row('id').eq(deckId)).run(conn, function (err, value) {
			if (err) return console.log(err)
			value.toArray(function (err, [deck]) {
				if (err) return console.log(err)
				if (!deck) return console.log('Deck not found')
				console.log(deck)
				room.memberDeck(userId, deck)
				room.startGame()
				console.log('=== Started game yo')
				console.log('Room:\n', room)

				// Emit the things to the people
				const roomSockets = Object.values(io.in(roomId).sockets)
				roomSockets.forEach(roomSocket => {
					const userId = roomSocket.handshake.session.user.id
					const fields = {...room.fields}
					if (userId in room.fields) {
						fields[userId] = fields[userId].privateJSON()
					}
					roomSocket.emit('gameStart', roomId, room.fields)
				})
			})
		})
	})

	// User sends ready
	socket.on('deckInRoom', function (roomId, deckId) {
		console.log('[deckInRoom', roomId, deckId)
		if (!socket.handshake.session) return
		const room = rooms.get(roomId)
		if (!room) return

		const userId = socket.handshake.session.user.id

		if (!deckId) {
			room.memberDeck(userId, null)
			return
		}
		io.sockets.in(roomId).emit('roomUsers', roomId, room.memberList)
		r.table('decks').filter(r.row('owner').eq(userId)).filter(r.row('id').eq(deckId)).run(conn, function (err, value) {
			if (err) return console.log(err)
			value.toArray(function (err, [deck]) {
				if (err) return console.log(err)
				if (!deck) return console.log('Deck not found')
				console.log(deck)
				room.memberDeck(userId, deck)
				io.sockets.in(roomId).emit('roomUsers', roomId, room.memberList)
			})
		})
	})

	//Unready
	socket.on('unReady', function (roomId) {
		if (!socket.handshake.session) return
		const room = rooms.get(roomId)
		if (!room) return
		const userId = socket.handshake.session.user.id
		const userIndex = room.members.findIndex(u => u.id === userId)
		room.members[userIndex].ready = false
		io.sockets.in(roomId).emit('roomUsers', roomId, room.memberList)
	})

	// Record the user leaving a room
	function leaveRoom (roomId) {
		if (!socket.handshake.session) return
		const room = rooms.get(roomId)
		if (!room) return

		const ownerChanged = socket.handshake.session.user.id === room.ownerId

		// Remove the user from the room
		room.removeMember(socket.handshake.session.user.id)
		socket.leave(roomId)

		// If the room is empty, remove it
		if (!room.members.length) {
			rooms.delete(roomId)
			return io.sockets.emit('activeRooms', rooms)
		}

		io.sockets.emit('activeRooms', rooms)

		io.sockets.in(roomId).emit('roomUsers', roomId, room.memberList)
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
			room.messages.push(msg2)
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

		data.msg = data.msg.replace(/^\s+|\s+$/g, '')
		const room = rooms.get(data.roomId)

		if (data.msg.startsWith('/')) {
			// Boom command
			const args = data.msg.substr(1).split(' ')
			const command = args.shift().toLowerCase()

			if (['me', 'action'].includes(command)) {
				return io.sockets.in(data.roomId).emit('newMessage', {
					type: 'action',
					author: {
						id: socket.handshake.session.user.id,
						username: socket.handshake.session.user.username,
					},
					content: args.join(' '),
					roomId: data.roomId,
					timestamp: Date.now()
				})
			}
		}

		const _msg = {
			type: 'normal',
			author: {
				id: socket.handshake.session.user.id,
				username: socket.handshake.session.user.username
			},
			content: data.msg,
			roomId: data.roomId,
			timestamp: Date.now()
		}
		if (!_msg.content) return // No empty messages
		room.messages.push(_msg)
		io.sockets.in(data.roomId).emit('newMessage', _msg)
	})

	//shuffling
	function shuffle () {
		for (let i in this.gameDeck) {
			const j = Math.floor(Math.random() * this.gameDeck.length)
			const temp = this.gameDeck[i]
			this.gameDeck[i] = this.gameDeck[j]
			this.gameDeck[j] = temp
		}
	}

	socket.on('eval', function (data) {
		console.log(eval(data))
	})
}
