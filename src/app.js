const path = require('path')

// Express
const express = require('express')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const nuxt = require('./nuxt.js')

// Sockets
const socketio = require('socket.io')
const sharedsession = require('express-socket.io-session')

// Database
const r = require('rethinkdb')
const dbConfig = require('./dbConfig.json')


// Create an express app
const app = express()
const server = require('http').createServer(app)

// Add session storage
const sessionStore = new expressSession.MemoryStore()
const session = new expressSession({
    store: sessionStore,
    secret: 'this is hell'
    // resave: true,
    // saveUninitialized: true
})
app.use(session)
// public stuff temp TODO
app.use(express.static(path.resolve(__dirname, '..', 'static')))
// Cookies and parsers
app.use(bodyParser())
app.use(cookieParser())

// Nuxt stuff
app.use(nuxt)

// Initialize the HTTP web server
const port = process.env.PORT || 3000
server.listen(port, function () {
    console.log('[http] Server listening on', port)
})

// Set up websocket shit
const io = socketio(server)
io.use(sharedsession(session, {
    autoSave:true
}), cookieParser)

// Initialize the database connection and start our stuff after
r.connect(dbConfig, function (err, conn) {
    if (err) {
        console.log(err)
        process.exit(1)
    }
    console.log('[db] Database listening on', dbConfig.port)

    // Log everyone out on server start because lul
    r.db('batorume').table('selectors').update({loggedIn: false}).run(conn)

    // Register express paths for logging in/out
    require('./logins.js')(app, r, conn)

    // Accept incoming socket connections
    io.on('connection', function (socket) {
        require('./sockets/builder.js')(io, socket, r, conn)
        require('./sockets/rooms.js')(io, socket, r, conn)
        require('./sockets/misc.js')(io, socket, r, conn)
    })
})

// Nuxt event handling
process.on('nuxt:build:done', err => {
	if (err) {
		console.log(err)
		process.exit(1)
	}
})

// TODO: User class, have the rooms only store the ID, this will let us do
// actions in a room when a person changes usernames and stuff
