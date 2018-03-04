module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'wix-maybe',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'reina why' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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
