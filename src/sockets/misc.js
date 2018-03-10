module.exports = function (socket) {    //Logged in users stay logged in
	socket.on('checkLogin', function () {
		if (socket.handshake.session && socket.handshake.session.user) {
			socket.emit('loggedIn')
		}
	})
}
