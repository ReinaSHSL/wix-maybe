const Room = require('./Room.js')
const allCards = require('./allCards.json')
const escapeHTML = require('./util.js').escapeHTML

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

    //Fucking murder me builder shit

    //Filters cards
    socket.on('cardSearch', function (cardSearch) {
    // Execute the search and store matches
        var matchingCards = allCards.filter(card => {
            if (cardSearch.inputName) {
                if (!(card.name.toLowerCase().includes(cardSearch.inputName.toLowerCase()))) {
                    return false
                }
            }
            if (cardSearch.inputLevel) {
                if (!card.level || card.level !== cardSearch.inputLevel) {
                    return false
                }
            }
            if (cardSearch.inputColor) {
                if (!card.color || card.color !== cardSearch.inputColor) {
                    return false
                }
            }
            if (cardSearch.inputType) {
                if (!card.type || card.type !== cardSearch.inputType) {
                    return false
                }
            }
            if (cardSearch.inputClass) {
                if (!card.class || card.class !== cardSearch.inputClass) {
                    return false
                }
            }
            if (cardSearch.checkBurst) {
                if (!card.burst || card.burst !== cardSearch.checkBurst) {
                    return false
                }
            }
            if (cardSearch.checkNoBurst) {
                if (card.burst || card.burst == cardSearch.checkBurst) {
                    return false
                }
            }
            // Looks like all the checks passed, we'll use this card
            return true
        })

        // All right, we got all the matches, let's add them back to the page now
        for (var card of matchingCards) {
            socket.emit('cardMatches', card)
        }

        // Dereference the objects so when they're removed they don't memleak the event handlers
        if (card) {
            card = null
        }
    })

    //Save
    socket.on('saveDeck', function (data) {
        if (!socket.handshake.session) return

        r.table('decks').filter(r.row('id').eq(data.id || '')).run(conn, function (err, cursor) {
            if (err) return console.log (err)
            cursor.toArray(function (err, result) {
                if (err) return console.log(err)
                if (result[0]) {
                    r.table('decks').get(data.id).update({deck: data.deck, name: data.name}).run(conn, function (err, updated) {
                        if (err) return console.log(err)
                        if (updated) {
                            socket.emit('updatedDeck')
                            return
                        }
                    })
                }
                if (!result[0]) {
                    r.table('decks').insert({
                        deck: data.deck,
                        owner: socket.handshake.session.user.id,
                        name: data.name
                    }).run(conn, function (err, insert) {
                        if (err) return console.log(err)
                        if (insert) {
                            let genKey = insert.generated_keys[0]
                            socket.emit('savedDeck', genKey)
                        }
                    })
                }
            })
        })
    })

    //Load decks on login
    socket.on('loadDecks', function () {
        console.log('loading decks')
        console.log(socket.handshake.session.user)
        if (!socket.handshake.session) return
        r.table('decks').filter(r.row('owner').eq(socket.handshake.session.user.id)).run(conn, function (err, cursor) {
            if (err) return console.log (err)
            cursor.toArray(function (err, result) {
                if (err) return console.log(err)
                for (let deck of result) {
                    socket.emit('loadDeck', deck)
                }
            })
        })
    })

    //Load cards
    socket.on('updateDeck', function (data) {
        r.table('decks').filter(r.row('id').eq(data)).run(conn, function (err, cursor) {
            if (err) return console.log(err)
            cursor.toArray(function (err, result) {
                if (err) return console.log(err)
                if (!result[0]) return console.log('reee')
                if (result) {
                    var deck = {}
                    deck.lrig = result[0].deck.lrig.map(id => allCards.find(card => card.id === id))
                    deck.main = result[0].deck.main.map(id => allCards.find(card => card.id === id))
                    socket.emit('deckUpdate', deck)
                }
            })
        })
    })

    //Changing Decks
    socket.on('deckChange', function (data) {
        r.table('decks').filter(r.row('id').eq(data)).run(conn, function (err, cursor) {
            if (err) return console.log(err)
            cursor.toArray(function (err, result) {
                if (err) return console.log(err)
                if (!result[0]) return //Safety feature
                if (result) {
                    var deck = {}
                    deck.lrig = result[0].deck.lrig.map(id => allCards.find(card => card.id === id))
                    deck.main = result[0].deck.main.map(id => allCards.find(card => card.id === id))
                    socket.emit('deckUpdate', deck)
                }
            })
        })
    })

    //Deleting decks
    socket.on('deleteDeck', function (data) {
        if (!data) {
            socket.emit('deleted')
        }
        r.table('decks').get(data).delete().run(conn, function (err) {
            if (err) return console.log(err)
            socket.emit('deleted')
        })
    })

    //Importing decks
    socket.on('importDeck', function (data) {
        try {
            let oldDeck = JSON.parse(data.deck)
            let newDeck = {}
            newDeck.lrig = oldDeck.lrig.map(id => allCards.find(card => card.id === id))
            newDeck.main = oldDeck.main.map(id => allCards.find(card => card.id === id))
            let tempId = Math.random()
            socket.emit('importComplete', {deck: newDeck, name: data.name, tempId: tempId})
        } catch (err) {
            return console.log(err)
        }
    })

    //Checks if an already saved deck has unsaved changes
    socket.on('checkIfSaved', function (data) {
        r.table('decks').get(data.dbDeck).run(conn, function (err, deck) {
            if (err) return console.log(err)
            if (deck) {
                if (data.currentDeck.lrig.length !== deck.deck.lrig.length) {
                    socket.emit('unsavedDeck')
                    return
                }
                if (data.currentDeck.main.length !== deck.deck.main.length) {
                    socket.emit('unsavedDeck')
                    return
                }
                for (let card in deck.lrig) {
                    if (deck.deck.lrig[card] !== data.currentDeck.lrig[card]) {
                        socket.emit('unsavedDeck')
                        return
                    }
                }
                for (let card in deck.main) {
                    if (deck.deck.main[card] !== data.currentDeck.main[card]) {
                        socket.emit('unsavedDeck')
                        return
                    }
                }
                r.table('decks').filter(r.row('id').eq(data.newDeck)).run(conn, function (err, cursor) {
                    if (err) return console.log(err)
                    cursor.toArray(function (err, result) {
                        if (err) return console.log(err)
                        if (!result[0]) return
                        if (result) {
                            var deck = {}
                            deck.lrig = result[0].deck.lrig.map(id => allCards.find(card => card.id === id))
                            deck.main = result[0].deck.main.map(id => allCards.find(card => card.id === id))
                            socket.emit('deckUpdate', deck)
                        }
                    })
                })
            }
        })
    })

    socket.on('eval', function (data) {
        console.log(eval(data))
    })
}
