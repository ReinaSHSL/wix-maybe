//this shit searches the name
function search(){
  var results = document.getElementById('results');
  while (results.firstChild) {
    results.removeChild(results.firstChild);
}
  var input, filter, ul, li, i;
  input = document.getElementById('cardName');
  filter = input.value;
  //ul=document.getElementById("placeholders")
  //li = ul.getElementsByTagName('li')
   //if found returns value to allcards.find and by extension matchingCard
  var matchingCards = ALLCARDS.filter(card => card.name.toLowerCase().includes(filter.toLowerCase()))
  for(card of matchingCards){
    var img = document.createElement('img')
    img.src = card.image
    var listItem = document.createElement('li')
    listItem.appendChild(img)
    results.appendChild(img)
  }
}

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
    name: 'diabride',
    image: 'http://i.imgur.com/zvqh8zV.jpg',
    type: TYPE.SIGNI,
    color: COLOR.RED,
    class: CLASS.SOMECLASS,
    attack: '...', // idk what type this is
    burst: true,
    level: 5
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
