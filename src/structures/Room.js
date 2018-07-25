const Field = require('./Field.js')

class Room {
	constructor (name, password, id) {
		this.name = name
		this.password = password
		this.id = id
		this.messages = []
		// Future code
		// while (this.id == null || rooms.map(r => r.id).indexOf(this.id) > -1) {
		//     this.id++
		// }
		this.id += '' // this shouldn't be necessary but we add it for safety
		this.members = []
		this.ownerId = undefined
		this.fields = {}
		this.inGame = false
	}

	addMember (member) {
		member = {id: member.id, username: member.username, ready: member.ready || false}
		this.members.push(member)
		if (this.members.length === 1) {
			this.owner = member
		}
	}

	removeMember (id) {
		const index = this.members.findIndex(u => u.id === id)
		this.members.splice(index, 1)

		if (id === this.ownerId && this.members.length) {
			this.owner = this.members[0]
		}
	}

	memberDeck (id, deck) {
		const index = this.members.findIndex(u => u.id === id)
		// We can't have more than two people ready at once
		if (deck && this.members.filter(u => u.ready).length >= 2) return

		this.members[index].deck = deck
		this.members[index].ready = deck ? true : false
	}

	set owner (user) {
		this.ownerId = user.id
	}

	get owner () {
		return this.members.find(u => u.id === this.ownerId)
	}

	get memberList () {
		// Remember: Object.assign(a, b) puts the properties of b onto a, but we
		// want to make a copy without modifying the original, so we do
		// Object.assign({}, a, b) to get a copy with the properties modified
		return this.members.map(u => Object.assign({}, u, { // create clone of u with modified properties
			deck: undefined, // Don't send the client the decks of other users
			owner: u.id === this.ownerId // Easier client-side rendering
		})).sort((u1, u2) => {
			if (u1.owner && !u2.owner) return -1
			if (u2.owner && !u1.owner) return 1
			return u1.username.localeCompare(u2.username)
		})
	}

	toJSON () {
		return {
			name: this.name,
			id: this.id,
			members: this.memberList,
			owner: this.owner,
			hasPassword: this.password ? true : false,
			inGame: this.inGame,
		}
	}

	withMessages () {
		let json = this.toJSON()
		json.messages = this.messages
		return json
	}

	inspect () {
		return this.toJSON()
	}

	startGame () {
		// Initialize a field for the two ready players
		for (let player of this.members.filter(user => user.ready).slice(0, 2)) {
			const field = new Field()
			field.zones.mainDeck.addCard(...player.deck.deck.main)
			field.zones.lrigDeck.addCard(...player.deck.deck.lrig)
			this.fields[player.id] = field
		}
		this.inGame = true
	}
}

module.exports = Room
