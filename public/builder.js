var currentDecks = {lrig: [], main: []};

// Function to take card data and make it into markup
// function cardElementFromData (card) {
//   var img = document.createElement('img')
//   img.src = card.image
//   img.classList.add('card-preview')
//   var listItem = document.createElement('li')
//   listItem.appendChild(img)
//   listItem.classList.add('card')
//   img.setAttribute('dataName', card.name || "")
//   img.setAttribute('dataType', card.type || "")
//   img.setAttribute('dataColor', card.color || "")
//   img.setAttribute('dataLevel', card.level || "")
//   img.setAttribute('dataCost', card.cost || "")
//   img.setAttribute('dataAttack', card.attack || "")
//   img.setAttribute('dataClass', card.class || "")
//   img.setAttribute('dataLrigType', card.lrigType || "")
//   img.setAttribute('dataLimit', card.limit || "")
//   img.setAttribute('dataText', card.text || "")
//   img.setAttribute('dataCardId', card.id)
//   return listItem
// }
//
function cardElementFromData (card) {
  var img = $('<img class="card-preview">')
    .attr('src', card.image)
  var listItem = $('<li class="card">')
    .attr('dataName', card.name || '')
    .attr('dataType', card.type || "")
    .attr('dataColor', card.color || "")
    .attr('dataLevel', card.level || "")
    .attr('dataCost', card.cost || "")
    .attr('dataAttack', card.attack || "")
    .attr('dataClass', card.class || "")
    .attr('dataLrigType', card.lrigType || "")
    .attr('dataLimit', card.limit || "")
    .attr('dataText', card.text || "")
    .attr('dataCardId', card.id)
    .append(img)
  return listItem.eq(0) // TODO: Convert calls of this to use jQuery
}

//Search Function
function search(){
  var results = $('#results');
  results.empty();

  // Get the search parameters from the interface
  var inputName = $('#cardName').val();
  var inputLevel = $('#cardLevel').val();
  var inputColor = $('#cardColor').val();
  var inputType = $('#cardType').val();
  var inputClass = $('#cardClass').val();
  var checkBurst = $('#burst').is(':checked');
  var checkNoBurst = $('#noBurst').is(':checked');
  // If everything is empty, just return - no point in listing every card
  if (!inputName && !inputLevel && !inputColor && !inputType && !inputClass) return

  // Execute the search and store matches
  var matchingCards = ALLCARDS.filter(card => {
    if (inputName) {
      if (!(card.name.toLowerCase().includes(inputName.toLowerCase()))) {
        return false;
      }
    }
    if (inputLevel) {
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
    results.append(cardElementFromData(card))
  }

  // Dereference the objects so when they're removed they don't memleak the event handlers
  searchCardImgs = null;
  if (card) card = null;
}
// Search function ends here

// Some event listeners for cards now

// When hovering over any card preview, show it in the left column
$('.cardList').on('mouseenter', '.card', function () {
  var $this = $(this);
  $('#previewCard').attr('src', $this.find('.card-preview').attr('src'));
  $('#cardsName').text($this.attr('dataName'));
  $('#cardsType').text($this.attr('dataType'));
  $('#cardsColor').text($this.attr('dataColor'));
  $('#cardsLevel').text($this.attr('dataLevel'));
  $('#cardsCost').text($this.attr('dataCost'));
  $('#cardsAttack').text($this.attr('dataAttack'));
  $('#cardsClass').text($this.attr('dataClass'));
  $('#cardsLrigType').text($this.attr('dataLrigType'));
  $('#cardsLimit').text($this.attr('dataLimit'));
  $('#cardsText').text($this.attr('dataText'));
})

// When clicking on a card in the right sidebar, add it to the deck
$('#results').on('click', '.card', function () {
  var $this = $(this);
  var cardsType = $this.attr('dataType')
  if(cardsType==='LRIG' || cardsType==='RESONA' || cardsType==='ARTS'){
  	if(currentDecks.lrig.length<10){
  	  currentDecks.lrig.push(parseInt($this.attr('dataCardId'), 10));
   	  $('#lrigDeckDisplay').append($this.clone())
    }
  }
   else{
   	if(currentDecks.main.length<40){
   	  currentDecks.main.push(parseInt($this.attr('dataCardId'), 10));
   	  $('#mainDeckDisplay').append($this.clone())
    }
  }
 })

// When clicking on a card in the deck area, remove it from the deck
$('#mainDeckDisplay').on('click', '.card', function () {
  var $wrap = $(this)//.parent()
  currentDecks.main.splice($wrap.index(), 1)
  $wrap.remove()
})
$('#lrigDeckDisplay').on('click', '.card', function () {
  var $wrap = $(this)
  currentDecks.lrig.splice($wrap.index(), 1)
  $wrap.remove()
})


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
