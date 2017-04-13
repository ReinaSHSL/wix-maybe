// Enumerations of card property values.
const TYPE = Object.freeze({
  SIGNI: Symbol('Type Signi'),
  LRIG: Symbol('Type Lrig'),
  SPELL: Symbol('Type Spell'),
  ARTS: Symbol('Type Arts')
})
const COLOR = Object.freeze({
  RED: Symbol('Color Red'),
  GREEN: Symbol('Color Green'),
  BLUE: Symbol('Color Blue')
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
    name: 'Otherthing',
    image: 'http://some.other.url',
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
