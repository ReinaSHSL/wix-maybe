const path = require('path')
const express = require('express')
const favicon = require('serve-favicon')
const r = require('rethinkdb')
const dbConfig = require('./dbConfig')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const httpPort = 3000

// Initialize the database connection and store it for use later
var conn = null
r.connect(dbConfig, function (err, connection) {
    console.log('[db] Database listening on', dbConfig.port)
    if (err) return console.log(err)
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


let rooms = []
class Room {
    constructor (name, pass, id) {
        this.name = name
        this.pass = pass
        this.id = id
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
        this.members.push(member)
        if (this.members.length === 1) {
            this.owner = member
        }
    }

    removeMember (id) {
        const index = this.members.findIndex(u => u.id === id)
        this.members.splice(index, 1)

        if (id === this.ownerId && this.members.length) {
            this.owner = this.members[0]
        }
    }

    set owner (user) {
        this.ownerId = user.id
    }

    get owner () {
        return this.members.find(u => u.id === this.ownerId)
    }

    get hasPassword () {
        return this.pass ? true : false
    }

    toJSON () {
        return {
            name: this.name,
            id: this.id,
            members: this.members,
            owner: this.owner,
            hasPassword: this.hasPassword
        }
    }

    inspect () {
        return this.toJSON()
    }
}
function getRoom (id) {
    return rooms.find(r => r.id === id)
}

// Accept incoming socket connections
io.on('connection', function (socket) {
    socket.join('chat') // TODO: is this necessary?

    // Send the list of active rooms to the client
    socket.emit('activeRooms', rooms)

    // Creates rooms
    socket.on('createRoom', function (data) {
        console.log('[createRoom]', data)
        var roomId = '' + data.id
        socket.room = roomId
        const room = new Room(data.name, data.pass, roomId)
        room.addMember({id: socket.id, username: socket.username})
        socket.join(roomId)
        io.sockets.emit('activeRooms', rooms)
        io.sockets.in(roomId).emit('roomUserUpdate', socket.username)
    })

    //Joining Rooms
    socket.on('joinRoom', function (data) {
        console.log('[joinRoom]', data)
        const id = data.id
        const pass = data.pass
        const room = getRoom(id)
        if (room.members.length > 1) {
            return socket.emit('joinRoomFail', 'Room full')
        }
        if (room.pass && pass !== room.pass) {
            return socket.emit('joinRoomFail', 'Missing or incorrect password')
        }
        socket.join(id)
        socket.room = id
        room.addMember({
            id: socket.id,
            username: socket.username
        })
        socket.emit('joinRoomSuccess', room)
        io.sockets.in(id).emit('roomUserUpdateOnJoin', {roomInfo: rooms, user: socket.username, room: socket.room})
    })

    //Leaving Lobby
    socket.on('leaveRoom', function () {
        const room = getRoom(socket.room)
        if (!room) {
            console.log("Someone tried to leave a room that doesn't exist. Did the server just restart?")
            return
        }

        // Remove the user from the room's members
        room.removeMember(socket.id)
        console.log(rooms)

        // If the room is empty, remove it
        if (!room.members.length) {
            rooms.splice(rooms.findIndex(r => r.id === socket.room), 1)
            return io.sockets.emit('emptyRoom', socket.room)
        }
        io.sockets.in(socket.room).emit('userLeft', socket.username)
        socket.leave(socket.room)
        socket.room = ''
    })

    //Username shit
    socket.on('setUsername', function (username) {
        console.log('[setUsername]', username)
        socket.username = username
    })

    //Lobby chatting
    socket.on('sendLobbyMessage', function (msg) {
        console.log('[sendLobbyMessage]', msg)
        io.sockets.in(socket.room).emit('newLobbyMessage', {author: socket.username, content: msg})
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
            console.log(card)
        }

        // Dereference the objects so when they're removed they don't memleak the event handlers
        if (card) {
            card = null
        }
    })

    //Database

    //Login
    socket.on('login', function (data) {
        r.table('selectors').filter(r.row('username').eq(data.username)).run(conn, function (err, cursor) {
            // TODO: This means there are no users in the database yet.
            if (err && err.name === 'ReqlNonExistenceError') return console.log('shit')

            if (err) return console.log(err)
            cursor.toArray(function (err, result) {
                if (err) console.log(err)
                result = result[0]
                if (!result) return socket.emit('loginFail', 'Unknown username')
                console.log(result)
                console.log(data.username)
                console.log(data.password)
                if (data.username === result.username && data.password === result.password) {
                    socket.user = result.id
                    return socket.emit('loginSuccess')
                }
                return socket.emit('loginFail', 'Incorrect username or password')
            })
        })
    })


    //Registering
    socket.on('register', function (data) {
        r.table('selectors').max('id').run(conn, function (err, _user) {
            if (err) console.log(err)
            let id = _user.id
            console.log('User with the highest id is', _user)
            const newUser = {
                id: ++id,
                username: data.username,
                password: data.password
            }
            r.db('people').table('selectors').insert(newUser).run(conn, function (err, res) {
                if (err) return console.log('welp')
                console.log(res)
            })
        })
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
        attack: 'Attack: 12000', // idk what type this is
        burst: true,
        level: '4',
        text: '[Constant]: When this SIGNI attacks, you may banish up to 2 of your other SIGNI. Then, add 1 card from your Ener Zone to your hand for each SIGNI banished this way.\nLife Burst: [Ener Charge 2]'
    }
])
