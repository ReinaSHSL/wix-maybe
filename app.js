const path = require('path')

// Express
const express = require('express')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')

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
// Static directory for web siles
app.use(express.static(path.join(__dirname, 'public')))
// Favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
// Cookies and parsers
app.use(bodyParser())
app.use(cookieParser())

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

    // Register express paths for logging in/out
    require('./logins.js')(app, r, conn)

    // Accept incoming socket connections
    io.on('connection', function (socket) {
        require('./sockets/builder.js')(io, socket, r, conn)
        require('./sockets/rooms.js')(io, socket, r, conn)
        require('./sockets/misc.js')(socket)
    })
})

// TODO: User class, have the rooms only store the ID, this will let us do
// actions in a room when a person changes usernames and stuff
