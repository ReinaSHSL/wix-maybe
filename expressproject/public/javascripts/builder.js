// Enumerations of card property values.
const TYPE = Object.freeze({
  SIGNI: Symbol('Type Signi'),
  LRIG: Symbol('Type Lrig'),
  SPELL: Symbol('Type Spell'),
  ART: Symbol('Type Art'),
  RESONA: Symbol('Type Resona')
})
const COLOR = Object.freeze({
  RED: Symbol('Color Red'),
  GREEN: Symbol('Color Green'),
  BLUE: Symbol('Color Blue'),
  BLACK: Symbol('Color Black'),
  WHITE: Symbol('Color White'),
  COLORLESS: Symbol('Color Colorless')
})
const CLASS = Object.freeze({
  SOMECLASS: Symbol('Class Someclass'),
  OTHERCLASS: Symbol('Class Otherclass')
})

// A listing of every card in its default state.
const ALLCARDS = Object.freeze([
  {
    id: 0,
    name: 'Something',
    image: 'http://some.url',
    type: TYPE.SIGNI,
    color: COLOR.RED,
    class: CLASS.SOMECLASS,
    attack: '...', // idk what type this is
    burst: true,
    level: 1
  },
  {
    id: 1,
    name: 'nanashi',
    image: 'http://i.imgur.com/YcMdHLJ.jpg',
    type: TYPE.LRIG,
    color: COLOR.GREEN,
    limit: 10,
    cost: {
      amount: 1,
      color: COLOR.RED
    },
    level: 1
  }
])

/*

Other notes:
- Signi and spells go in the main deck, while lrig, art, and resona go in the lrig deck

*/
