var path = require('path')
var express = require('express')
var favicon = require('serve-favicon')

var app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = 3000

server.listen(port, function () {
    console.log('Server listening on %d', port)
})

// This folder contains the client stuff
app.use(express.static(path.join(__dirname, 'public')))
// Favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

var activeRooms = {}


io.on('connection', function (socket) {
    socket.join('chat')
    socket.room = ''
    socket.username = ''

    // Send the list of active rooms to the client
    socket.emit('activeRooms', activeRooms)

    // Creates rooms
    socket.on('createRoom', function (roomData) {
        var roomId = parseInt(roomData.id)
        socket.room = roomId
        activeRooms[roomId] =  {
            name: roomData.name,
            users: [],
            roomLeader: socket.id,
            ids: [socket.id],
            pass: roomData.pass || undefined
        }
        activeRooms[roomId].users.push(socket.username)
        // console.log(activeRooms)
        socket.join(roomId)
        io.sockets.emit('activeRooms', activeRooms)
        io.sockets.in(roomId).emit('roomUserUpdate', socket.username)
        // console.log('Room leader in ' + socket.room + ' is ' + activeRooms[roomId].roomLeader)
        // console.log('Ids in room ' + socket.room + ' are ' + activeRooms[roomId].ids)
    })

    //Joining Rooms
    socket.on('enteringRoom', function (enteringRoom) {
        if (activeRooms[enteringRoom].users.length < 2) {
            if (!activeRooms[enteringRoom].pass) {
                socket.join(enteringRoom)
                socket.room = enteringRoom
                activeRooms[enteringRoom].users.push(socket.username)
                activeRooms[enteringRoom].ids.push(socket.id)
                socket.emit('roomSuccess', activeRooms[enteringRoom])
                io.sockets.in(enteringRoom).emit('roomUserUpdateOnJoin', {roomInfo: activeRooms, user: socket.username, room: socket.room})
            }
            if (activeRooms[enteringRoom].pass) {
                socket.emit('passwordPrompt', enteringRoom)
            }
        } else {
            socket.emit('roomFull')
        }
    })
    socket.on('enteredPassword', function (enteredPassword) {
        if (activeRooms[enteredPassword.roomId].pass === enteredPassword.passEntered) {
            socket.join(enteredPassword.roomId)
            socket.room = enteredPassword.roomId
            activeRooms[enteredPassword.roomId].users.push(socket.username)
            activeRooms[enteredPassword.roomId].ids.push(socket.id)
            socket.emit('roomSuccess', activeRooms[enteredPassword.roomId])
            io.sockets.in(enteredPassword.roomId).emit('roomUserUpdateOnJoin', {roomInfo: activeRooms, user: socket.username, room: socket.room})
            console.log(activeRooms)
            console.log('Ids in room ' + socket.room + ' are ' + activeRooms[enteredPassword.roomId].ids)
        }
    })

    //Leaving Lobby
    socket.on('leaveRoom', function () {
        var index = activeRooms[socket.room].users.indexOf(socket.username)
        activeRooms[socket.room].users.splice(index, 1)
        var idIndex = activeRooms[socket.room].ids.indexOf(socket.id)
        activeRooms[socket.room].ids.splice(idIndex, 1)
        console.log(activeRooms)
        if (activeRooms[socket.room].ids.length) {
            if (socket.id === activeRooms[socket.room].roomLeader) {
                if (activeRooms[socket.room].ids.length) {
                    activeRooms[socket.room].roomLeader = ''
                    activeRooms[socket.room].roomLeader = activeRooms[socket.room].ids[0]
                    console.log('Room Leader is ' + activeRooms[socket.room].roomLeader)
                }
            }
        }
        else {
            delete activeRooms[socket.room]
            io.sockets.emit('emptyRoom', socket.room)
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
        console.log(socket.username)
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

})
