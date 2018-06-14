const path = require('path')
const config = require('./config.js')

// Express
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const nuxt = require('./src/nuxt.js')

// Sockets
const socketio = require('socket.io')
const sharedsession = require('express-socket.io-session')

// Database
const r = require('rethinkdb')


// Create an express app
const app = express()
const server = require('http').createServer(app)

// Add session storage
const sessionStore = new expressSession.MemoryStore() // TODO
const session = new expressSession({
	store: sessionStore,
	secret: 'this is hell',

	// TODO: Change these two when shiftinf off MemoryStore
	resave: true,
	saveUninitialized: true
})
app.use(session)
// Cookies and parsers
// app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cookieParser())

// Nuxt stuff
app.use(nuxt)

// Set up websocket server
const io = socketio(server)
io.use(sharedsession(session, {
	autoSave:true
}), cookieParser)

// Initialize the database connection and start our stuff after
r.connect(config.rethinkdb, async function (err, conn) {
	if (err) throw err
	console.log('RethinkDB connected on port', config.rethinkdb.port)

	// Log everyone out on server start because lul
	r.db('batorume').table('selectors').update({loggedIn: false}).run(conn)

	// Register express paths for logging in/out
	require('./src/logins.js')(app, r, conn)

	// Accept incoming socket connections
	io.on('connection', function (socket) {
		require('./src/sockets/builder.js')(io, socket, r, conn)
		require('./src/sockets/rooms.js')(io, socket, r, conn)
		require('./src/sockets/misc.js')(io, socket, r, conn)
	})

	// Build the Nuxt application
	await nuxt.start(config.nuxt)

	// Now that we're built and everything's good, we can start the server
	server.listen(config.server.port, function () {
		console.log('HTTP server listening on', config.server.port)
	})
})

// Nuxt event handling
process.on('nuxt:build:done', err => {
	console.log('[nuxt:build:done]')
	if (err) {
		console.log(err)
		process.exit(1)
	}
})

// TODO: User class, have the rooms only store the ID, this will let us do
// actions in a room when a person changes usernames and stuff
