const config = require('./config')

module.exports = {
	// Show timestamps on messages
	timestamps: true,
	// Custom levels for HTTP and websocket events
	levels: {
		ws: {style: 'magenta'},
		http: {style: 'cyan'}
	},
	// No levels are ignored if dev mode is enabled
	ignoreLevels: config.dev ? [] : ['ws', 'http', 'debug']
}
