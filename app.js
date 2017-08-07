const path = require('path')
const express = require('express')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')({
    secret: 'this is hell',
    resave: true,
    saveUninitialized: true
})
const r = require('rethinkdb')
const dbConfig = require('./dbConfig')
const sharedsession = require('express-socket.io-session')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const httpPort = 3000
app.use(session)
io.use(sharedsession(session, {
    autoSave:true
}), cookieParser)

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
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
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
class Room {
    constructor (name, password, id) {
        this.name = name
        this.password = password
        this.id = id
        this.messages = []
        // Future code
        // while (this.id == null || rooms.map(r => r.id).indexOf(this.id) > -1) {
        //     this.id++
        // }
        this.id += '' // this shouldn't be necessary but we add it for safety
        this.members = []
        rooms.push(this)
        this.ownerId = undefined
    }

    addMember (member) {
        console.log('[addMember]', member)
        console.log(this.members)
        this.members.push(member)
        if (this.members.length === 1) {
            console.log('Making owner')
            this.owner = member
        }
    }

    removeMember (id) {
        console.log('[removeMember]')
        const index = this.members.findIndex(u => u.id === id)
        this.members.splice(index, 1)

        if (id === this.ownerId && this.members.length) {
            this.owner = this.members[0]
        }
        console.log(this.members, this.membersSorted)
    }

    set owner (user) {
        this.ownerId = user.id
    }

    get owner () {
        return this.members.find(u => u.id === this.ownerId)
    }

    get hasPassword () {
        return this.password ? true : false
    }

    get membersSorted () {
        // Array.from() returns a new array so we don't modify this.members with
        // the map function
        return Array.from(this.members).map(u => {
            if (u.id === this.ownerId) u.owner = true
            return u
        })
    }

    toJSON () {
        return {
            name: this.name,
            id: this.id,
            members: this.members,
            owner: this.owner,
            hasPassword: this.hasPassword,
            messages: this.messages
        }
    }

    inspect () {
        return this.toJSON()
    }
}
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

//Register
app.post('/signup', function (req, res) {
    // If they left off information, error back
    if (!req.body.username || !req.body.password) {
        return res.status(400).send('Invalid details!')
    }
    const username = req.body.username
    const unhashedPassword = req.body.password
    // Hash the password
    // TODO: I don't know much about security but I know doing this here is bad
    let hashedPassword = 5381
    for (let i = 0; i < unhashedPassword.length; i++) {
        let char = unhashedPassword.charCodeAt(i)
        hashedPassword = ((hashedPassword << 5) + hashedPassword) + char /* hash * 33 + c */
    }

    // Let's see if we have this username
    r.table('selectors').filter(r.row('username').eq(username)).run(conn, function (err, cursor) {
        if (err) {
            console.log(err)
            return res.status(500).send('Server error; check the console')
        }
        cursor.toArray(function (err, result) {
            if (err) {
                console.log(err)
                return res.status(500).send('Server error; check the console')
            }
            // We do already have this username, rip
            if (result[0]) return res.status(400).send('Username in use')

            // Get the highest ID
            r.table('selectors').max('id').getField('id').run(conn, function (err, id) {
                if (err && err.name === 'ReqlNonExistenceError') {
                    // There are no users yet, so we'll start at 0
                    id = 0
                } else if (err) {
                    // We actually fucked something up
                    console.log(err)
                    return res.status(500).send('Server error; check the console')
                } else {
                    // Increment the alst user's ID to get the next one
                    id++
                }
                const user = {
                    id: id,
                    username: username,
                    password: hashedPassword
                }

                // Insert the user into the table now
                r.table('selectors').insert(user).run(conn, function (err) {
                    if (err) {
                        console.log(err)
                        return res.status(500).send('Server error; check the console')
                    }
                    // Finally, we did it!
                    res.status(200).send('Registered')
                })
            })
        })
    })
})

//Login
app.post('/login', function (req, res) {
    if (req.session.user) {
        return res.status(400).send('Already logged in')
    }
    if (!req.body.username || !req.body.password) {
        return res.status(400).send('Insert username and password')
    }

    const username = req.body.username
    const unhashedPassword = req.body.password

    let hashedPassword = 5381
    for (let i = 0; i < unhashedPassword.length; i++) {
        let char = unhashedPassword.charCodeAt(i)
        hashedPassword = ((hashedPassword << 5) + hashedPassword) + char /* hash * 33 + c */
    }

    r.table('selectors').filter(r.row('username').eq(username)).run(conn, function (err, cursor) {
        if (err) {
            console.log(err)
            return res.status(500).send('Server error; check the console')
        }
        cursor.toArray(function (err, result) {
            if (err) {
                console.log(err)
                return res.status(500).send('Server error; check the console')
            }
            const user = result[0]
            if (result[1]) {
                console.log("Go clean up your database, there's a duplicated user here")
                console.log(user)
                console.log(result[1])
            }
            if (!user || hashedPassword !== user.password) {
                return res.status(400).send('Incorrect or invalid credentials')
            }
            if (result[0].loggedIn) {
                return res.status(400).send('This account is already logged in')
            }
            r.table('selectors').get(result[0].id).update({loggedIn:true}).run(conn, function (err, logIn) {
                if (err) console.log(err)
                if (logIn) {
                    req.session.user = user // This stores the user's session for later
                    return res.status(200).send('Logged in')
                }
            })
        })
    })
})

//Log Out
var logOutVar
app.post('/logout', function (req, res) {
    if (!req.session.user) {
        return
    }
    let userId = req.session.user.id
    r.table('selectors').get(userId).update({loggedIn: false}).run(conn, function (err, out) {
        if (err) return console.log(err)
        if (out) {
            logOutVar = req.session.user
            res.status(200).send('Logged Out')
            req.session.destroy()
        }
    })
})


// Accept incoming socket connections
io.on('connection', function (socket) {
    console.log('[connection]')
    // Send the list of active rooms to the client
    socket.emit('activeRooms', rooms)

    //Logged in users stay logged in
    socket.on('checkLogin', function () {
        let sessionID = socket.handshake.sessionID
        let sessionObject = socket.handshake.sessionStore.sessions[sessionID]
        if (!sessionObject) {
            return
        }
        let currentUser = JSON.parse(sessionObject).user
        if (currentUser) {
            socket.emit('loggedIn')
        }
    })

    // Creates rooms
    socket.on('createRoom', function (data) {
        console.log('[createRoom]', data)
        let sessionID = socket.handshake.sessionID
        let sessionObject = socket.handshake.sessionStore.sessions[sessionID]
        if (!sessionObject) {
            return
        }
        let currentUser = JSON.parse(sessionObject).user

        const roomId = data.id
        const roomName = data.name
        const roomPass = data.password
        const room = new Room(roomName, roomPass, roomId)

        room.addMember({id: currentUser.id, username: currentUser.username})
        socket.join(roomId)

        io.sockets.emit('activeRooms', rooms)
        io.sockets.in(roomId).emit('roomUsers', room.membersSorted)

        const msg = {
            type: 'join',
            username: currentUser.username,
            roomId: roomId,
            timestamp: Date.now()
        }
        room.messages.push(msg)
        io.sockets.in(roomId).emit('newMessage', msg)
    })

    //Joining Rooms
    socket.on('joinRoom', function (data) {
        console.log('[joinRoom]', data)

        let sessionID = socket.handshake.sessionID
        let sessionObject = socket.handshake.sessionStore.sessions[sessionID]
        if (!sessionObject) {
            return socket.emit('joinRoomFail', "You don't appear to have a session")
        }
        let currentUser = JSON.parse(sessionObject).user

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
            id: currentUser.id,
            username: currentUser.username
        })
        socket.emit('joinRoomSuccess', room)
        io.sockets.in(id).emit('roomUsers', room.membersSorted)
        const msg = {
            type: 'join',
            username: currentUser.username,
            roomId: id,
            timestamp: Date.now()
        }
        room.messages.push(msg)
        io.sockets.in(id).emit('newMessage', msg)
    })

    //Leaving Lobby
    socket.on('leaveRoom', function (roomId) {
        let sessionID = socket.handshake.sessionID
        let sessionObject = socket.handshake.sessionStore.sessions[sessionID]
        if (!sessionObject) {
            return
        }
        let currentUser = JSON.parse(sessionObject).user
        const room = getRoom(roomId)
        if (!room) {
            console.log("Someone tried to leave a room that doesn't exist. Did the server just restart?")
            return
        }
        const ownerChanged = currentUser.id === room.ownerId

        // Remove the user from the room
        room.removeMember(currentUser.id)

        // If the room is empty, remove it
        if (!room.members.length) {
            deleteRoom(roomId)
            return io.sockets.emit('activeRooms', rooms)
        }

        io.sockets.in(roomId).emit('roomUsers', room.membersSorted)
        const msg = {
            type: 'leave',
            username: currentUser.username,
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
    })

    //Die on refresh
    socket.on('imDeadKthx', function () {
        let currentUser
        let sessionID = socket.handshake.sessionID
        let sessionObject = socket.handshake.sessionStore.sessions[sessionID]
        if (!sessionObject) {
            if (!logOutVar) return
            currentUser = logOutVar
        }
        if (sessionObject) {
            currentUser = JSON.parse(sessionObject).user
        }
        if (!currentUser) return console.log('check')
        r.table('selectors').get(currentUser.id).update({loggedIn: false}).run(conn, function (err) {
            if (err) console.log(err)
            return console.log('Log out')
        })
        console.log('socket.rooms:', socket.rooms)
        console.log('otherRooms ' + rooms.map(r => r.id))
        for (let i in socket.rooms) {
            let room = getRoom(i)
            console.log('room')
            console.log(room)
            if (!room) {
                console.log('!room')
                console.log(room)
                continue
            }
            room.removeMember(currentUser.id)
            if (!room.members.length) {
                rooms.splice(rooms.findIndex(r => r.id === i, 1))
            }
            io.sockets.emit('activeRooms', rooms)
            socket.leave(i)
        }
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
        let sessionID = socket.handshake.sessionID
        let sessionObject = socket.handshake.sessionStore.sessions[sessionID]
        if (!sessionObject) {
            return
        }
        let currentUser = JSON.parse(sessionObject).user
        const room = getRoom(data.roomId)
        const _msg = {
            type: 'normal',
            author: {
                id: currentUser.id,
                username: currentUser.username
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
        let sessionID = socket.handshake.sessionID
        let sessionObject = socket.handshake.sessionStore.sessions[sessionID]
        if (!sessionObject) {
            return
        }
        let currentUser = JSON.parse(sessionObject).user
        r.table('decks').filter(r.row('id').eq(data.id || '')).run(conn, function (err, cursor) {
            if (err) return console.log (err)
            cursor.toArray(function (err, result) {
                if (err) return console.log(err)
                if (result[0]) {
                    r.table('decks').get(data.id).update({deck: data.deck, name: data.name}).run(conn, function (err, updated) {
                        if (err) return console.log(err)
                        if (updated) {
                            console.log('existing deck updated')
                            return
                        }
                    })
                }
                if (!result[0]) {
                    r.table('decks').insert({
                        deck: data.deck,
                        owner: currentUser.id,
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
        let sessionID = socket.handshake.sessionID
        let sessionObject = socket.handshake.sessionStore.sessions[sessionID]
        if (!sessionObject) {
            return
        }
        let currentUser = JSON.parse(sessionObject).user
        r.table('decks').filter(r.row('owner').eq(currentUser.id)).run(conn, function (err, cursor) {
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
