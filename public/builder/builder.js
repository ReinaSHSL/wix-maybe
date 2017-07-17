/* globals $ */
var socket = io()
var currentDecks = {lrig: [], main: []}

function cardElementFromData (cardMatches) {
    var img = $('<img class="card-preview">')
        .attr('src', cardMatches.image)
    var listItem = $('<li class="card">')
        .attr('dataName', cardMatches.name || '')
        .attr('dataType', cardMatches.type || '')
        .attr('dataColor', cardMatches.color || '')
        .attr('dataLevel', cardMatches.level || '')
        .attr('dataCost', cardMatches.cost || '')
        .attr('dataAttack', cardMatches.attack || '')
        .attr('dataClass', cardMatches.class || '')
        .attr('dataLrigType', cardMatches.lrigType || '')
        .attr('dataLimit', cardMatches.limit || '')
        .attr('dataText', cardMatches.text || '')
        .attr('dataCardId', cardMatches.id)
        .append(img)
    return listItem.eq(0) // TODO: Convert calls of this to use jQuery
}

//Search Function
function search () {
    var results = $('#results')
    results.empty()

    // Get the search parameters from the interface
    var inputName = $('#cardName').val()
    var inputLevel = $('#cardLevel').val()
    var inputColor = $('#cardColor').val()
    var inputType = $('#cardType').val()
    var inputClass = $('#cardClass').val()
    var checkBurst = $('#burst').is(':checked')
    var checkNoBurst = $('#noBurst').is(':checked')
    // If everything is empty, just return - no point in listing every card
    if (!inputName && !inputLevel && !inputColor && !inputType && !inputClass) return
    socket.emit('cardSearch', {inputName: inputName,
        inputLevel: inputLevel,
        inputColor: inputColor,
        inputType: inputType,
        inputClass: inputClass,
        checkBurst: checkBurst,
        checkNoBurst: checkNoBurst})

    socket.on('cardMatches', function (cardMatches) {
        for (var card of cardMatches) {
            results.append(cardElementFromData(cardMatches))
        }
    })
}
// Search function ends here

// Some event listeners for cards now

// When hovering over any card preview, show it in the left column
$('.cardList').on('mouseenter', '.card', function () {
    var $this = $(this)
    $('#previewCard').attr('src', $this.find('.card-preview').attr('src'))
    $('#cardsName').text($this.attr('dataName'))
    $('#cardsType').text($this.attr('dataType'))
    $('#cardsColor').text($this.attr('dataColor'))
    $('#cardsLevel').text($this.attr('dataLevel'))
    $('#cardsCost').text($this.attr('dataCost'))
    $('#cardsAttack').text($this.attr('dataAttack'))
    $('#cardsClass').text($this.attr('dataClass'))
    $('#cardsLrigType').text($this.attr('dataLrigType'))
    $('#cardsLimit').text($this.attr('dataLimit'))
    $('#cardsText').text($this.attr('dataText'))
})

// When clicking on a card in the right sidebar, add it to the deck
$('#results').on('click', '.card', function () {
    var $this = $(this)
    var cardsType = $this.attr('dataType')
    if (cardsType==='LRIG' || cardsType==='RESONA' || cardsType==='ARTS') {
        if (currentDecks.lrig.length<10) {
            currentDecks.lrig.push(parseInt($this.attr('dataCardId'), 10))
            $('#lrigDeckDisplay').append($this.clone())
        }
    }
    else {
        if (currentDecks.main.length<40) {
            currentDecks.main.push(parseInt($this.attr('dataCardId'), 10))
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



/*

Other notes:
- Signi and spells go in the main deck, while lrig, art, and resona go in the lrig deck

*/
