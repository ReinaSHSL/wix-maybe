var currentDeck=[];

// Function to take card data and make it into markup
function cardElementFromData (card) {
  var img = document.createElement('img')
  img.src = card.image
  img.classList.add('card-preview')
  var listItem = document.createElement('li')
  listItem.appendChild(img)
  listItem.classList.add('card')
  img.setAttribute('dataName', card.name || "")
  img.setAttribute('dataType', card.type || "")
  img.setAttribute('dataColor', card.color || "")
  img.setAttribute('dataLevel', card.level || "")
  img.setAttribute('dataCost', card.cost || "")
  img.setAttribute('dataAttack', card.attack || "")
  img.setAttribute('dataClass', card.class || "")
  img.setAttribute('dataLrigType', card.lrigType || "")
  img.setAttribute('dataLimit', card.limit || "")
  img.setAttribute('dataText', card.text || "")
  img.setAttribute('dataCardId', card.id)
  return listItem
}

//Search Function
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
  var checkNoBurst = document.getElementById('noBurst').checked;
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

    if(checkNoBurst){
      if(card.burst || card.burst == checkBurst){
        return false
      }
    }

    
    // Looks like all the checks passed, we'll use this card
    return true;
  })

  // All right, we got all the matches, let's add them back to the page now
  for (var card of matchingCards) {
    results.appendChild(cardElementFromData(card))
  }
  var searchCardImgs = document.getElementsByClassName('card-preview');
  var bigPreviewImg = document.getElementById('previewCard');
  for (var i = 0; i < searchCardImgs.length; i++) {
    var card = searchCardImgs[i];
    card.addEventListener('mouseenter', function (event) {
      bigPreviewImg.src = event.target.src;
      document.getElementById('cardsName').textContent = event.target.getAttribute('dataName');
      document.getElementById('cardsType').textContent = event.target.getAttribute('dataType');
      document.getElementById('cardsColor').textContent = event.target.getAttribute('dataColor');
      document.getElementById('cardsLevel').textContent = event.target.getAttribute('dataLevel');
      document.getElementById('cardsCost').textContent = event.target.getAttribute('dataCost');
      document.getElementById('cardsAttack').textContent = event.target.getAttribute('dataAttack');
      document.getElementById('cardsClass').textContent = event.target.getAttribute('dataClass');
      document.getElementById('cardsLrigType').textContent = event.target.getAttribute('dataLrigType');
      document.getElementById('cardsLimit').textContent = event.target.getAttribute('dataLimit');
      document.getElementById('cardsText').innerHTML = event.target.getAttribute('dataText');
    });
    //Adding cards function starts here
    card.addEventListener('click', function(event){
      currentDeck.push(event.target.getAttribute('dataCardId'));
      document.getElementById('deckDisplay').appendChild(event.target.cloneNode())
    });
  }

  // Dereference the objects so when they're removed they don't memleak the event handlers
  searchCardImgs = null;
  if (card) card = null;
}

// Search function ends here



// A listing of every card in its default state.
const ALLCARDS = Object.freeze([
  {
    id: 0,
    name: 'Diabride, Natural Pyroxene ※',
    image: 'http://i.imgur.com/zvqh8zV.jpg',
    type: 'SIGNI',
    color: 'Red',
    class: 'Gem',
    attack: 'Attack: 15000',
    burst: true,
    level: '5',
    text: "Hanayo Limited\n[Constant]: When this SIGNI has crushed 2 or more Life Cloth in 1 turn, up this SIGNI. This effect can only be triggered once per turn.\n[Constant]: When 1 of your <Ore> or <Gem> SIGNI is affected by the effects of your opponent's ARTS, damage your opponent. This effect can only be triggered once per turn. (If your opponent has no Life Cloth, you win the game.)\nLife Burst: Banish 1 of your opponent's SIGNI with power 10000 or less. If you have 2 or less Life Cloth, additionally, crush one of your opponent's Life Cloth."
  },
  {
    id: 1,
    name: 'Nanashi, That Four Another',
    image: 'http://i.imgur.com/YcMdHLJ.jpg',
    type: 'LRIG',
    color: 'Black',
    limit: 'Limit: 11',
    cost: 'Grow: Black 3',
    level: '4',
    lrigType: 'Nanashi',
    text: "[Constant]: All of your opponent's infected SIGNI get −1000 power.\n[Auto]: When your main phase starts, put 1 [Virus] on 1 of your opponent's SIGNI Zones.\n[Action] Blind Coin Coin: During your opponent's next turn, all of your SIGNI get \n[Shadow]. (Your SIGNI with [Shadow] cannot be chosen by your opponent's effects.)",
  },
  {
    id: 2,
    name: 'Beigoma, Fourth Play Princess ※',
    image: 'http://i.imgur.com/QemHU7N.jpg',
    type: 'SIGNI',
    color: 'Green',
    class: 'Playground Equipment',
    attack: 'Attack: 12000', // idk what type this is
    burst: true,
    level: '4',
    text: "[Constant]: When this SIGNI attacks, you may banish up to 2 of your other SIGNI. Then, add 1 card from your Ener Zone to your hand for each SIGNI banished this way.\nLife Burst: [Ener Charge 2]"
  }
])

/*

Other notes:
- Signi and spells go in the main deck, while lrig, art, and resona go in the lrig deck

*/
