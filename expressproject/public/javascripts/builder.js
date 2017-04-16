//<!--Search Function-->
function search(){
  // Clear out the search results element
  var results = document.getElementById('results');
  while (results.firstChild) {
    results.removeChild(results.firstChild);
  }

  // Get the search parameters from the interface
  var inputName = document.getElementById('cardName').value;
  var inputLevel = document.getElementById('cardLevel').value;
  var stupidDropdown = document.getElementById('cardColor');
  var stupidDropdown2 = document.getElementById('cardType');
  var stupidDropdown3 = document.getElementById('cardClass');
  var inputColor = stupidDropdown.options[stupidDropdown.selectedIndex].value
  var inputType = stupidDropdown2.options[stupidDropdown2.selectedIndex].value
  var inputClass = stupidDropdown3.options[stupidDropdown3.selectedIndex].value
  var checkBurst = document.getElementById('burst').checked;
  // If everything is empty, just return - no point in listing every card
  if (!inputName && !inputLevel && !inputColor && !inputType && !inputClass) {
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

    if(inputColor){
      if(!card.color || card.color !== inputColor){
        return false;
      }
    }

        if(inputType){        
      if(!card.type || card.type !== inputType){
        return false;
      }
    }

        if(inputClass){
      if(!card.class || card.class !== inputClass){
        return false;
      }
    }

        if(checkBurst){
      if(!card.burst || card.burst !== checkBurst){
        return false
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

//<!-- Search function ends here -->

//!--Preview Function start-->

//THIS SHIT DONT WORK PLS TO HELP. Function doesn't even activate on mouseover

document.getElementsByClassName('card-preview').onmouseover = function(){preview()}
  function preview(){
  console.log('test')
  var prev = document.createElement('img')
  img.src = card.image
  var listItem = document.createElement('li')
  listItem.appendChild(img)
  listItem.classList.add('card')
  preview.appendChild(img)
}

//!--Preview Function End-->

// A listing of every card in its default state.
const ALLCARDS = Object.freeze([
  {
    id: 0,
    name: 'diabride',
    image: 'http://i.imgur.com/zvqh8zV.jpg',
    type: 'SIGNI',
    color: 'Red',
    class: 'Gem',
    attack: '...', // idk what type this is
    burst: true,
    level: '5',
  },
  {
    id: 1,
    name: 'Nanashi, That Four Another',
    image: 'http://i.imgur.com/YcMdHLJ.jpg',
    type: 'LRIG',
    color: 'Black',
    limit: '11',
    cost: {
      amount: '3',
      color: 'Black'
    },
    level: '4',
    lrigType: 'Nanashi',
    Text: "[Constant]: All of your opponent's infected SIGNI get −1000 power.\n[Auto]: When your main phase starts, put 1 [Virus] on 1 of your opponent's SIGNI Zones.\n[Action] Blind Coin Coin: During your opponent's next turn, all of your SIGNI get \n[Shadow]. (Your SIGNI with [Shadow] cannot be chosen by your opponent's effects.)",
  },
   {
    id: 2,
    name: 'beigoma',
    image: 'http://i.imgur.com/QemHU7N.jpg',
    type: 'SIGNI',
    color: 'Green',
    class: 'Playground Equipment',
    attack: '...', // idk what type this is
    burst: false,
    level: '4',
  }
])

/*

Other notes:
- Signi and spells go in the main deck, while lrig, art, and resona go in the lrig deck

*/
