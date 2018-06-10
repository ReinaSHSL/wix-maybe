const Zone = require('./Zone.js')
class PrivateZone extends Zone {
	constructor () {
		super()
	}

	toJSON () {
		return {
			topCard: this.cards.length ? {image: 'https://i.imgur.com/39NPwdZ.png'} : {},
			size: this.cards.length
		}
	}
}
module.exports = PrivateZone
