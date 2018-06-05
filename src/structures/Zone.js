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
}

module.exports = Zone
