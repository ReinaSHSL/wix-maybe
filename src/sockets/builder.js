const allCards = require('../allCards.json')

//Fucking murder me builder shit
module.exports = function (io, socket, r, conn) {

	//Filters cards
	socket.on('cardSearch', function (options, res) {
		// Execute the search and store matches
		var matchingCards = allCards.filter(card => {
			if (options.inputName) {
				if (!(card.name.toLowerCase().includes(options.inputName.toLowerCase()))) {
					return false
				}
			}
			if (options.inputLevel) {
				if (!card.level || card.level !== options.inputLevel) {
					return false
				}
			}
			if (options.inputColor) {
				if (!card.color || card.color !== options.inputColor) {
					return false
				}
			}
			if (options.inputType) {
				if (!card.type || card.type !== options.inputType) {
					return false
				}
			}
			if (options.inputClass) {
				if (!card.class || card.class !== options.inputClass) {
					return false
				}
			}
			if (options.checkBurst) {
				if (!card.burst || card.burst !== options.checkBurst) {
					return false
				}
			}
			if (options.checkNoBurst) {
				if (card.burst || card.burst == options.checkBurst) {
					return false
				}
			}
			// Looks like all the checks passed, we'll use this card
			return true
		})

		// Send the list of matches back to the client
		res({success: true, cards: matchingCards})
	})

	//Save
	socket.on('saveDeck', function (data, res) {
		if (!socket.handshake.session) return

		r.table('decks').filter(r.row('id').eq(data.id || '')).run(conn, function (err, cursor) {
			if (err) return console.log (err)
			cursor.toArray(function (err, result) {
				if (err) return console.log(err)
				if (result[0]) {
					r.table('decks').get(data.id).update({deck: data.deck, name: data.name}).run(conn, function (err, updated) {
						if (err) return console.log(err)
						if (updated) {
							res({success: true})
							return
						}
					})
				}
				if (!result[0]) {
					r.table('decks').insert({
						deck: data.deck,
						owner: socket.handshake.session.user.id,
						name: data.name
					}).run(conn, function (err, insert) {
						if (err) return console.log(err)
						if (insert) {
							let genKey = insert.generated_keys[0]
							res({success: true, key: genKey})
						}
					})
				}
			})
		})
	})

	//Load decks on login
	socket.on('loadDecks', function (_, res) {
		console.log(socket.handshake.session.user)
		if (!socket.handshake.session) return
		r.table('decks').filter(r.row('owner').eq(socket.handshake.session.user.id)).run(conn, function (err, cursor) {
			if (err) return console.log (err)
			cursor.toArray(function (err, result) {
				if (err) return console.log(err)
				if (result) {
					res({success: true, decks: result})
				}
			})
		})
	})

	//Load cards
	socket.on('updateDeck', function (data, res) {
		r.table('decks').filter(r.row('id').eq(data)).run(conn, function (err, cursor) {
			if (err) return console.log(err)
			cursor.toArray(function (err, result) {
				if (err) return console.log(err)
				if (!result[0]) return console.log(result)
				if (result) {
					var deck = {}
					deck.lrig = result[0].deck.lrig.map(id => allCards.find(card => card.id === id))
					deck.main = result[0].deck.main.map(id => allCards.find(card => card.id === id))
					res({success: true, deck})
				}
			})
		})
	})

	//Changing Decks
	socket.on('deckChange', function (data, res) {
		r.table('decks').filter(r.row('id').eq(data)).run(conn, function (err, cursor) {
			if (err) return console.log(err)
			cursor.toArray(function (err, result) {
				if (err) return console.log(err)
				if (!result[0]) return //Safety feature
				if (result) {
					var deck = {}
					deck.lrig = result[0].deck.lrig.map(id => allCards.find(card => card.id === id))
					deck.main = result[0].deck.main.map(id => allCards.find(card => card.id === id))
					res({success: true, deck})
				}
			})
		})
	})

	//Deleting decks
	socket.on('deleteDeck', function (data, res) {
		if (!data) {
			res({success: true})
		}
		r.table('decks').get(data).delete().run(conn, function (err) {
			if (err) return console.log(err)
			res({success: true})
		})
	})

	//Importing decks
	socket.on('importDeck', function (data, res) {
		try {
			let oldDeck = JSON.parse(data.deck)
			let newDeck = {}
			newDeck.lrig = oldDeck.lrig.map(id => allCards.find(card => card.id === id))
			newDeck.main = oldDeck.main.map(id => allCards.find(card => card.id === id))
			let tempId = Math.random()
			res({success: true, deck: newDeck, name: data.name, tempId: tempId})
		} catch (err) {
			return console.log(err)
		}
	})

	//Checks if an already saved deck has unsaved changes
	socket.on('checkIfSaved', function (data, res) {
		r.table('decks').get(data.dbDeck).run(conn, function (err, deck) {
			if (err) return console.log(err)
			if (deck) {
				if (data.currentDeck.lrig.length !== deck.deck.lrig.length) {
					res({success: true, unsaved: true})
					return
				}
				if (data.currentDeck.main.length !== deck.deck.main.length) {
					res({success: true, unsaved: true})
					return
				}
				for (let card in deck.lrig) {
					if (deck.deck.lrig[card] !== data.currentDeck.lrig[card]) {
						res({success: true, unsaved: true})
						return
					}
				}
				for (let card in deck.main) {
					if (deck.deck.main[card] !== data.currentDeck.main[card]) {
						res({success: true, unsaved: true})
						return
					}
				}
				res({success: true, unsaved: false})

				// r.table('decks').filter(r.row('id').eq(data.newDeck)).run(conn, function (err, cursor) {
				// 	if (err) return console.log(err)
				// 	cursor.toArray(function (err, result) {
				// 		if (err) return console.log(err)
				// 		if (!result[0]) return
				// 		if (result) {
				// 			var deck = {}
				// 			deck.lrig = result[0].deck.lrig.map(id => allCards.find(card => card.id === id))
				// 			deck.main = result[0].deck.main.map(id => allCards.find(card => card.id === id))
				// 			socket.emit('deckUpdate', deck)
				// 		}
				// 	})
				// })
			}
		})
	})
}
