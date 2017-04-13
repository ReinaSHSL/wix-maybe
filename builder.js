// Enumerations of card property values.
const TYPE = Object.freeze({
  SIGNI: 'Type Signi',
  LRIG: 'Type Lrig',
  SPELL: 'Type Spell',
  ARTS: 'Type Arts'
})
const COLOR = Object.freeze({
  RED: 'Color Red',
  GREEN: 'Color Green',
  BLUE: 'Color Blue'
})
const CLASS = Object.freeze({
  SOMECLASS: 'Class Someclass',
  OTHERCLASS: 'Class Otherclass'
})

// A listing of every card in its default state.
const ALLCARDS = Object.freeze([
  {
    id: 0,
    name: 'Something',
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
