const Zone = require('./Zone.js')
const ALLCARDS = require('../allCards.json')

class LrigDeckZone extends Zone {
	constructor () {
		super()
	}

	toJSON () {
		return {
			topCard: this.cards.length ? {image: 'https://i.imgur.com/39NPwdZ.png'} : {},
			size: this.cards.length
		}
	}

	privateJSON () {
		this.cards.map(id => ALLCARDS.find(card => card.id === id))
	}
}
module.exports = LrigDeckZone
