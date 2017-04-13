class Card {
  constructor (options) {
    this.id = options.id
    this.name = options.name
    this.desc = options.desc
    this.image = options.image
    this.color = options.color
  }

  getPreviewHTML () {
    // Returns HTML that represents the card.
    // TODO
  }
}

class SigniCard extends Card {
  constructor (options) {
    super(options)
    this.level = options.level
    this.attack = options.attack
  }
}
class LrigCard extends Card {
  // TODO
  constructor (options) {
    super(options)
    this.level = options.level
    this.limit = options.limit
    this.cost = options.cost
  }
}
class SpellCard extends Card {
  constructor (options) {
    super(options)
    this.cost = options.cost
    this.burst = options.burst
  }
}
class ArtCard extends Card {
  constructor (options) {
    super(options)
    this.cost = options.cost
  }
}
class ResonaCard extends Card {
  constructor (options) {
    super(options)
    this.attack = options.attack
  }
}

// Takes a card ID as input and returns the corresponding card object.
function getCardByID (id) {
  // if the card doesn't exist, return nothing
  if (!ALLCARDS[id]) return
  // If the card does exist, call the right constructor and return that
  switch (ALLCARDS[id].type) {
    case TYPE.SIGNI: return new SigniCard(ALLCARDS[id])
    case TYPE.LRIG: return new LrigCard(ALLCARDS[id])
    case TYPE.SPELL: return new SpellCard(ALLCARDS[id])
    case TYPE.ART: return new ArtCard(ALLCARDS[id])
    case TYPE.RESONA: return new ResonaCard(ALLCARDS[id])
  }
  // The type didn't match, return nothing
  return undefined
}
