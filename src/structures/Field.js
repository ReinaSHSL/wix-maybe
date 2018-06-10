const Zone = require('./Zone.js')
const PrivateZone = require('./PrivateZone.js')
const LrigDeckZone = require('./LrigDeckZone.js')

class Field {
	constructor () {
		this.zones = {
			hand: new Zone(),
			mainDeck: new PrivateZone(),
			lrigDeck: new LrigDeckZone(),
			leftSigni: new Zone(),
			midSigni: new Zone(),
			rightSigni: new Zone(),
			trash: new Zone(),
			lrigTrash: new Zone(),
			check: new Zone(),
			lifeCloth: new PrivateZone(),
			ener: new Zone()
		}
	}

	privateJSON () {
		const privateZones = {}
		for (let zoneName in this.zones) {
			privateZones[zoneName] = this.zones[zoneName].privateJSON()
		}
		return privateZones
	}
}

module.exports = Field
