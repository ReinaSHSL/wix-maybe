const config = require('./config.js')
module.exports = {
	dev: config.dev,
	/*
	** Headers of the page
	*/
	head: {
		title: 'wix-maybe',
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
			{ hid: 'description', name: 'description', content: 'reina why' }
		],
		link: [
			{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
		],
		script: [
			{ src: 'https://use.fontawesome.com/releases/v5.0.8/js/all.js', defer: true }
		]
	},
	/*
	** Customize the progress bar color
	*/
	loading: { color: '#3B8070' },
	/*
	** Build configuration
	*/
	build: {
		vendor: ['axios']
	},
	plugins: [
		{src: '~/plugins/vue-websocket.js', ssr: false}
	]
}
