//this shit searches the name
function search(){
  // Clear out the search results element
  var results = document.getElementById('results');
  while (results.firstChild) {
    results.removeChild(results.firstChild);
  }

  // Get the search parameters from the interface
  var inputName = document.getElementById('cardName').value;
  var inputLevel = document.getElementById('cardLevel').value;
  // If everything is empty, just return - no point in listing every card
  if (!inputName && !inputLevel) {
    return
  }

  // Execute the search and store matches
  var matchingCards = ALLCARDS.filter(card => {
    // Check the name if one is set
    if (inputName) {
      //console.log('There\'s a thing here.')
      // If the card's name doesn't contain the input, ignore the card
      if (!(card.name.toLowerCase().includes(inputName.toLowerCase()))) {
        return false;
      }
    }

    // Check the level if one is set
    if (inputLevel) {
      //console.log("There's also a thing here.")
      // If the card has no level, or if the card's level doesn't match, ignore the card
      if (!card.level || card.level !== inputLevel) {
        return false;
      }
    }

    // Looks like all the checks passed, we'll use this card
    return true;
  })

  // All right, we got all the matches, let's add them back to the page now
  for (var card of matchingCards) {
    var img = document.createElement('img')
    img.src = card.image
    img.classList.add('card-preview')
    var listItem = document.createElement('li')
    listItem.appendChild(img)
    listItem.classList.add('card')
    results.appendChild(img)
  }
}

/*
//this shit searches card level
function levelSearch(){
  var results = document.getElementById('results');
  while (results.firstChild) {
    results.removeChild(results.firstChild);
}
  var input, filter, ul, li, i;
  input = document.getElementById('cardLevel');
  filter = input.value;
    if(filter===''){
    return
  }
   //if found returns value to allcards.filter and by extension matchingCard
  var matchingCards = ALLCARDS.filter(card => card.level.toLowerCase().includes(filter.toLowerCase()))
  for(card of matchingCards){
    var img = document.createElement('img')
    img.src = card.image
    img.classList.add('card-preview')
    var listItem = document.createElement('li')
    listItem.appendChild(img)
    listItem.classList.add('card')
    results.appendChild(img)
  }
}
*/

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
    level: '5',
  },
  {
    id: 1,
    name: 'Nanashi, That Four Another',
    image: 'http://i.imgur.com/YcMdHLJ.jpg',
    type: TYPE.LRIG,
    color: COLOR.BLACK,
    limit: 11,
    cost: {
      amount: 3,
      color: COLOR.BLACK
    },
    level: '4',
    lrigType: 'Nanashi',
    Text: "[Constant]: All of your opponent's infected SIGNI get −1000 power.\n[Auto]: When your main phase starts, put 1 [Virus] on 1 of your opponent's SIGNI Zones.\n[Action] Blind Coin Coin: During your opponent's next turn, all of your SIGNI get \n[Shadow]. (Your SIGNI with [Shadow] cannot be chosen by your opponent's effects.)",
  },
   {
    id: 0,
    name: 'diabride',
    image: 'http://i.imgur.com/zvqh8zV.jpg',
    type: TYPE.SIGNI,
    color: COLOR.RED,
    class: CLASS.SOMECLASS,
    attack: '...', // idk what type this is
    burst: true,
    //level: '5',
  }
])

/*

Other notes:
- Signi and spells go in the main deck, while lrig, art, and resona go in the lrig deck

*/
