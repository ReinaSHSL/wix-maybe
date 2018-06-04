class Zone {
	constructor () {
		this.cards = []
		this.downed = false
	}
	addCard (card) {
		this.cards.push(card)
	}
	removeCard (card) {
		let index = this.cards.findIndex(anotherCard => card.id === anotherCard.id)
		this.cards.splice(index, 1)
	}
}

module.exports = Zone
