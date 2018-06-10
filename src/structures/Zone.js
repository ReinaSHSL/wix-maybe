const ALLCARDS = require('../allCards')
class Zone {
	constructor () {
		this.cards = []
		this.downed = false
	}
	addCard (...cards) {
		this.cards.push(...cards)
	}
	removeCard (card) {
		let index = this.cards.findIndex(anotherCard => card.id === anotherCard.id)
		this.cards.splice(index, 1)
	}
	get size () {
		return this.cards.length
	}
	toJSON () {
		return {
			downed: this.downed,
			cards: this.cards.map(id => ALLCARDS.find(card => card.id === id)),
		}
	}
	privateJSON () {
		return this.toJSON()
	}
}

module.exports = Zone
