const ALLCARDS = require('../allCards')
class Zone {
	constructor (hidden = false) {
		this.cards = []
		this.downed = false
		this.hidden = hidden
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
    	if (this.hidden) {
			return {
		        size: this.cards.length,
		        topCard: ALLCARDS.find(card => card.id === this.cards[0]),
		        hidden: this.hidden
	    	}
		} else {
			return {
		        downed: this.downed,
		        cards: this.cards.map(id => ALLCARDS.find(card => card.id === id)),
		        hidden: this.hidden
			}
    	}
	}
}

module.exports = Zone
