var path = require('path')
var express = require('express')
var favicon = require('serve-favicon')

var app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = 3000

r = require('rethinkdb')

server.listen(port, function () {
    console.log('Server listening on %d', port)
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

// Initialize the database connection and store it for use later
var conn = null
r.connect({host: 'localhost', port: 28015, db: 'people'}, function (err, connection) {
    console.log('[db] Database connection ready!')
    if (err) return console.log(err)
    conn = connection
})

io.on('connection', function (socket) {
    socket.join('chat')
    socket.room = ''
    socket.username = ''

    // Send the list of active rooms to the client
    socket.emit('activeRooms', rooms)

    // Creates rooms
    socket.on('createRoom', function (roomData) {
        console.log('[createRoom]', roomData)
        var roomId = '' + roomData.id
        socket.room = roomId
        const room = new Room(roomData.name, roomData.pass, roomId)
        room.addMember({id: socket.id, username: socket.username})
        // console.log(activeRooms)
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
        console.log(id)
        console.log(rooms)
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
    var connection = null
    socket.on('login', function (data) {
        r.table('selectors').filter(r.row('id').eq(data.username)).run(conn, function (err, cursor) {
            if (err) return console.log(err)
            cursor.toArray(function (err, result) {
                if (err) console.log(err)
                result = result[0]
                if (!result) return console.log('Invalid username')
                console.log(result)
                console.log(data.username)
                console.log(data.pass)
                if (data.username === result.id) {
                    var password = JSON.stringify(data.pass)
                    if (password ===  result.password) {
                        socket.user = data.username
                        console.log('yay')
                    }
                    if (password !== result.password) {
                        socket.emit('incorrect')
                    }
                }
                if (data.username !== result.id) {
                    socket.emit('incorrect')
                }
            })
        })
    })

    //Register
    socket.on('register', function (data) {
        r.table('selectors').insert([{id: data.username, password: data.pass}]).run(conn, function (err, result) {
            if (err) console.log('welp')
            console.log('registered')
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
