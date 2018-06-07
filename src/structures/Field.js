const Zone = require('./Zone.js')

class Field {
	constructor () {
		this.zones = {
			hand: new Zone(),
			mainDeck: new Zone(true),
			lrigDeck: new Zone(true),
			leftSigni: new Zone(),
			midSigni: new Zone(),
			rightSigni: new Zone(),
			trash: new Zone(),
			lrigTrash: new Zone(),
			check: new Zone(),
			lifeCloth: new Zone(true),
			ener: new Zone()
		}
	}
}

module.exports = Field
