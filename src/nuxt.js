// Nuxt middleware - handles web requests and builds our templates into pages
const resolve = require('path').resolve
const { Nuxt, Builder } = require('nuxt')

let nuxt

// Setup nuxt.js
function start (config = {}) {
	return new Promise(resolve => {
		nuxt = new Nuxt(config)
		if (config.dev) {
			const builder = new Builder(nuxt)
			builder.build().then(resolve)
		} else {
			process.nextTick(resolve)
		}
	})
}

// Add nuxt.js middleware
function middleware (req, res, next) {
	// TODO: better logic should probably be here and/or in nuxt.config.js
	if (req.method === 'GET') {
		nuxt.render(req, res)
	} else {
		next()
	}
}

module.exports = middleware
module.exports.start = start
