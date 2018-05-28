const allCards = require('../allCards.json')

//Fucking murder me builder shit
module.exports = function (io, socket, r, conn) {

	//Filters cards
	socket.on('cardSearch', function (cardSearch) {
		// Execute the search and store matches
		var matchingCards = allCards.filter(card => {
			if (cardSearch.inputName) {
				if (!(card.name.toLowerCase().includes(cardSearch.inputName.toLowerCase()))) {
					return false
				}
			}
			if (cardSearch.inputLevel) {
				if (!card.level || card.level !== cardSearch.inputLevel) {
					return false
				}
			}
			if (cardSearch.inputColor) {
				if (!card.color || card.color !== cardSearch.inputColor) {
					return false
				}
			}
			if (cardSearch.inputType) {
				if (!card.type || card.type !== cardSearch.inputType) {
					return false
				}
			}
			if (cardSearch.inputClass) {
				if (!card.class || card.class !== cardSearch.inputClass) {
					return false
				}
			}
			if (cardSearch.checkBurst) {
				if (!card.burst || card.burst !== cardSearch.checkBurst) {
					return false
				}
			}
			if (cardSearch.checkNoBurst) {
				if (card.burst || card.burst == cardSearch.checkBurst) {
					return false
				}
			}
			// Looks like all the checks passed, we'll use this card
			return true
		})

		// All right, we got all the matches, let's add them back to the page now
		for (var card of matchingCards) {
			socket.emit('cardMatches', card)
		}

		// Dereference the objects so when they're removed they don't memleak the event handlers
		if (card) {
			card = null
		}
	})

	//Save
	socket.on('saveDeck', function (data) {
		if (!socket.handshake.session) return

		r.table('decks').filter(r.row('id').eq(data.id || '')).run(conn, function (err, cursor) {
			if (err) return console.log (err)
			cursor.toArray(function (err, result) {
				if (err) return console.log(err)
				if (result[0]) {
					r.table('decks').get(data.id).update({deck: data.deck, name: data.name}).run(conn, function (err, updated) {
						if (err) return console.log(err)
						if (updated) {
							socket.emit('updatedDeck')
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
							socket.emit('savedDeck', genKey)
						}
					})
				}
			})
		})
	})

	//Load decks on login
	socket.on('loadDecks', function () {
		console.log('loading decks')
		console.log(socket.handshake.session.user)
		if (!socket.handshake.session) return
		r.table('decks').filter(r.row('owner').eq(socket.handshake.session.user.id)).run(conn, function (err, cursor) {
			if (err) return console.log (err)
			cursor.toArray(function (err, result) {
				if (err) return console.log(err)
				if (result) {
					socket.emit('loadDeck', result)
				}
			})
		})
	})

	//Load cards
	socket.on('updateDeck', function (data) {
		r.table('decks').filter(r.row('id').eq(data)).run(conn, function (err, cursor) {
			if (err) return console.log(err)
			cursor.toArray(function (err, result) {
				if (err) return console.log(err)
				if (!result[0]) return console.log(result)
				if (result) {
					var deck = {}
					deck.lrig = result[0].deck.lrig.map(id => allCards.find(card => card.id === id))
					deck.main = result[0].deck.main.map(id => allCards.find(card => card.id === id))
					socket.emit('deckUpdate', deck)
				}
			})
		})
	})

	//Changing Decks
	socket.on('deckChange', function (data) {
		r.table('decks').filter(r.row('id').eq(data)).run(conn, function (err, cursor) {
			if (err) return console.log(err)
			cursor.toArray(function (err, result) {
				if (err) return console.log(err)
				if (!result[0]) return //Safety feature
				if (result) {
					var deck = {}
					deck.lrig = result[0].deck.lrig.map(id => allCards.find(card => card.id === id))
					deck.main = result[0].deck.main.map(id => allCards.find(card => card.id === id))
					socket.emit('deckUpdate', deck)
				}
			})
		})
	})

	//Deleting decks
	socket.on('deleteDeck', function (data) {
		if (!data) {
			socket.emit('deleted')
		}
		r.table('decks').get(data).delete().run(conn, function (err) {
			if (err) return console.log(err)
			socket.emit('deleted')
		})
	})

	//Importing decks
	socket.on('importDeck', function (data) {
		try {
			let oldDeck = JSON.parse(data.deck)
			let newDeck = {}
			newDeck.lrig = oldDeck.lrig.map(id => allCards.find(card => card.id === id))
			newDeck.main = oldDeck.main.map(id => allCards.find(card => card.id === id))
			let tempId = Math.random()
			socket.emit('importComplete', {deck: newDeck, name: data.name, tempId: tempId})
		} catch (err) {
			return console.log(err)
		}
	})

	//Checks if an already saved deck has unsaved changes
	socket.on('checkIfSaved', function (data) {
		r.table('decks').get(data.dbDeck).run(conn, function (err, deck) {
			if (err) return console.log(err)
			if (deck) {
				if (data.currentDeck.lrig.length !== deck.deck.lrig.length) {
					socket.emit('unsavedDeck')
					return
				}
				if (data.currentDeck.main.length !== deck.deck.main.length) {
					socket.emit('unsavedDeck')
					return
				}
				for (let card in deck.lrig) {
					if (deck.deck.lrig[card] !== data.currentDeck.lrig[card]) {
						socket.emit('unsavedDeck')
						return
					}
				}
				for (let card in deck.main) {
					if (deck.deck.main[card] !== data.currentDeck.main[card]) {
						socket.emit('unsavedDeck')
						return
					}
				}
				r.table('decks').filter(r.row('id').eq(data.newDeck)).run(conn, function (err, cursor) {
					if (err) return console.log(err)
					cursor.toArray(function (err, result) {
						if (err) return console.log(err)
						if (!result[0]) return
						if (result) {
							var deck = {}
							deck.lrig = result[0].deck.lrig.map(id => allCards.find(card => card.id === id))
							deck.main = result[0].deck.main.map(id => allCards.find(card => card.id === id))
							socket.emit('deckUpdate', deck)
						}
					})
				})
			}
		})
	})
}
