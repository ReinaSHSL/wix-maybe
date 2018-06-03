const CardStack = require('./zone.js')
class Field {
	constructor () {
		this.zones = {
        	hand: new CardStack(),
			mainDeck: new CardStack(),
			lrigDeck: new CardStack(),
			leftSigni: new CardStack(),
			midSigni: new CardStack(),
			rightSigni: new CardStack(),
			trash: new CardStack(),
			lrigTrash: new CardStack(),
			check: new CardStack(),
			lifeCloth: new CardStack(),
			ener: new CardStack()
		}
	}
}