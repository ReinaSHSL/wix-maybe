const dev = process.env.NODE_ENV !== 'production'

module.exports = {
	// Dev mode (auto-rebuild, etc.) enabled if true
	dev,
	// Database configuration
	db: {
		host: process.env.RETHINKDB_HOST || 'localhost',
		port: process.env.RETHINKDB_PORT || 28015,
		db: 'batorume'
	},
	// Web server options
	server: {
		port: process.env.PORT || 3000
	},
	nuxt: Object.assign(require('./nuxt.config'), {dev})
}
