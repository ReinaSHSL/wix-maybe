const Zone = require('./Zone.js')

class Field {
	constructor () {
		this.zones = {
			hand: new Zone(),
			mainDeck: new Zone(),
			lrigDeck: new Zone(),
			leftSigni: new Zone(),
			midSigni: new Zone(),
			rightSigni: new Zone(),
			trash: new Zone(),
			lrigTrash: new Zone(),
			check: new Zone(),
			lifeCloth: new Zone(),
			ener: new Zone()
		}
	}
}

module.exports = Field
