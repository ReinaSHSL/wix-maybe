const path = require('path')
const express = require('express')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const sessionStore = new expressSession.MemoryStore()
const session = new expressSession({
    store: sessionStore,
    secret: 'this is hell'
    // resave: true,
    // saveUninitialized: true
})
const r = require('rethinkdb')
const dbConfig = require('./dbConfig')
const sharedsession = require('express-socket.io-session')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const httpPort = process.env.PORT || 3000
app.use(session)
io.use(sharedsession(session, {
    autoSave:true
}), cookieParser)

const Room = require('./Room.js')

// Escapes special characters for HTML.
// https://stackoverflow.com/a/12034334/1070107
const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
}
function escapeHTML (string) {
    return String(string).replace(/[&<>"'`=/]/g, function (s) {
        return entityMap[s]
    })
}

// Initialize the database connection and store it for use later
var conn = null
r.connect(dbConfig, function (err, connection) {
    if (err) {
        console.log(err)
        process.exit(1)
    }
    console.log('[db] Database listening on', dbConfig.port)
    conn = connection

    // Register express paths for logging in/out
    require('./logins.js')(app, r, conn)
})

// Initialize the HTTP web server
server.listen(httpPort, function () {
    console.log('[http] Server listening on', httpPort)
})

// This folder contains the client stuff
app.use(express.static(path.join(__dirname, 'public')))
// Favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
// Cookies and shit
app.use(bodyParser())
app.use(cookieParser())
app.use(session)

// TODO: User class, have the rooms only store the ID, this will let us do
// actions in a room when a person changes usernames and stuff

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

// Accept incoming socket connections
io.on('connection', function (socket) {
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
        var matchingCards = ALLCARDS.filter(card => {
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
                    deck.lrig = result[0].deck.lrig.map(id => ALLCARDS.find(card => card.id === id))
                    deck.main = result[0].deck.main.map(id => ALLCARDS.find(card => card.id === id))
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
                    deck.lrig = result[0].deck.lrig.map(id => ALLCARDS.find(card => card.id === id))
                    deck.main = result[0].deck.main.map(id => ALLCARDS.find(card => card.id === id))
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
            newDeck.lrig = oldDeck.lrig.map(id => ALLCARDS.find(card => card.id === id))
            newDeck.main = oldDeck.main.map(id => ALLCARDS.find(card => card.id === id))
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
                            deck.lrig = result[0].deck.lrig.map(id => ALLCARDS.find(card => card.id === id))
                            deck.main = result[0].deck.main.map(id => ALLCARDS.find(card => card.id === id))
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
})



// A listing of every card in its default state.
const ALLCARDS = Object.freeze([
    {
        id: 0,
        name: 'Diabride, Natural Pyroxene ※',
        image: 'http://i.imgur.com/zvqh8zV.jpg',
        type: 'SIGNI',
        color: 'Red',
        class: 'Gem',
        attack: 'Attack: 15000',
        burst: true,
        level: '5',
        text: "Hanayo Limited\n[Constant]: When this SIGNI has crushed 2 or more Life Cloth in 1 turn, up this SIGNI. This effect can only be triggered once per turn.\n[Constant]: When 1 of your <Ore> or <Gem> SIGNI is affected by the effects of your opponent's ARTS, damage your opponent. This effect can only be triggered once per turn. (If your opponent has no Life Cloth, you win the game.)\nLife Burst: Banish 1 of your opponent's SIGNI with power 10000 or less. If you have 2 or less Life Cloth, additionally, crush one of your opponent's Life Cloth."
    },
    {
        id: 1,
        name: 'Nanashi, That Four Another',
        image: 'http://i.imgur.com/YcMdHLJ.jpg',
        type: 'LRIG',
        color: 'Black',
        limit: 'Limit: 11',
        cost: 'Grow: Black 3',
        level: '4',
        lrigType: 'Nanashi',
        text: "[Constant]: All of your opponent's infected SIGNI get −1000 power.\n[Auto]: When your main phase starts, put 1 [Virus] on 1 of your opponent's SIGNI Zones.\n[Action] Blind Coin Coin: During your opponent's next turn, all of your SIGNI get \n[Shadow]. (Your SIGNI with [Shadow] cannot be chosen by your opponent's effects.)",
    },
    {
        id: 2,
        name: 'Beigoma, Fourth Play Princess ※',
        image: 'http://i.imgur.com/QemHU7N.jpg',
        type: 'SIGNI',
        color: 'Green',
        class: 'Playground Equipment',
        attack: 'Attack: 12000',
        burst: true,
        level: '4',
        text: '[Constant]: When this SIGNI attacks, you may banish up to 2 of your other SIGNI. Then, add 1 card from your Ener Zone to your hand for each SIGNI banished this way.\nLife Burst: [Ener Charge 2]'
    }
])
