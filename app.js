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

    // Accept incoming socket connections
    io.on('connection', function (socket) {
        require('./sockets.js')(io, socket, r, conn)
    })
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
