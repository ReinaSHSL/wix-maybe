/* globals $, socket */
var currentDecks = {lrig: [], main: []}

const $builderButton = $('.builder-button')
const $builderPanel = $('.panel.builder')

$builderButton.click(function () {
    if ($builderPanel.is(':visible')) {
        $builderPanel.hide()
        $('#mainDeckDisplay').empty()
        $('#lrigDeckDisplay').empty()
        $('.panel:not(.builder, .login)').show()
        $builderButton.text('Open Deck Builder')

    } else {
        if(!$('#deckList').val()) {
            $('#deckList').append('<option value=unsaved> Blank Deck </option>')
        }
        let deckId = $('#deckList :selected').attr('value')
        socket.emit('updateDeck', deckId)
        $('.panel').hide()
        $builderPanel.show()
        $builderButton.text('Close Deck Builder')
    }
})

function cardElementFromData (card) {
    var $img = $('<img class="card-preview">')
        .attr('src', card.image)
    var $listItem = $('<li class="card">')
        .attr('dataName', card.name || '')
        .attr('dataType', card.type || '')
        .attr('dataColor', card.color || '')
        .attr('dataLevel', card.level || '')
        .attr('dataCost', card.cost || '')
        .attr('dataAttack', card.attack || '')
        .attr('dataClass', card.class || '')
        .attr('dataLrigType', card.lrigType || '')
        .attr('dataLimit', card.limit || '')
        .attr('dataText', card.text || '')
        .attr('dataCardId', card.id)
        .append($img)
    return $listItem
}

//Search Function
var $results = $('#results')
function search () {
    $results.empty()

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
    socket.emit('cardSearch', {
        inputName: inputName,
        inputLevel: inputLevel,
        inputColor: inputColor,
        inputType: inputType,
        inputClass: inputClass,
        checkBurst: checkBurst,
        checkNoBurst: checkNoBurst
    })

}
socket.on('cardMatches', function (cardMatches) {
    $results.append(cardElementFromData(cardMatches))
})
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
        if (currentDecks.lrig.length < 10) {
            currentDecks.lrig.push(parseInt($this.attr('dataCardId'), 10))
            $('#lrigDeckDisplay').append($this.clone())
        }
    } else {
        if (currentDecks.main.length < 40) {
            currentDecks.main.push(parseInt($this.attr('dataCardId'), 10))
            $('#mainDeckDisplay').append($this.clone())
        }
    }
})

//Displays cards from server
socket.on('deckUpdate', function (deck) {
    currentDecks.lrig = []
    currentDecks.main = []
    for (let card of deck.lrig) {
        currentDecks.lrig.push(parseInt(card.id))
        $('#lrigDeckDisplay').append(cardElementFromData(card))
    } 
    for (let card of deck.main) {
        currentDecks.main.push(parseInt(card.id))
        $('#mainDeckDisplay').append(cardElementFromData(card))
    }
})

//Updates deck on dropdown change
$('#deckList').change(function () {
    $('#mainDeckDisplay').empty()
    $('#lrigDeckDisplay').empty()
    currentDecks.lrig = []
    currentDecks.main = []
    let deckId = $('#deckList :selected').attr('value')
    socket.emit('deckChange', deckId) 
}) 
socket.on('deckChange', function (deck) {
    currentDecks.lrig = []
    currentDecks.main = []
    for (let card of deck.lrig) {
        currentDecks.lrig.push(parseInt(card.id))
        $('#lrigDeckDisplay').append(cardElementFromData(card))
    } 
    for (let card of deck.main) {
        currentDecks.main.push(parseInt(card.id))
        $('#mainDeckDisplay').append(cardElementFromData(card))
    }
})


// When clicking on a card in the deck area, remove it from the deck
$('#mainDeckDisplay').on('click', '.card', function () {
    var $wrap = $(this)
    currentDecks.main.splice($wrap.index(), 1)
    $wrap.remove()
})
$('#lrigDeckDisplay').on('click', '.card', function () {
    var $wrap = $(this)
    currentDecks.lrig.splice($wrap.index(), 1)
    $wrap.remove()
})

$('#save').on('click', function () {
    let deckName = $('#deckList :selected').text()
    let deckId = $('#deckList :selected').attr('value')
    socket.emit('saveDeck', {deck: currentDecks, name: deckName, id: deckId})
})

$('#ren').on('click', function () {
    const newName = prompt('Rename to what?')
    $('#deckList :selected').text(newName)
})

$('#new').on('click', function () {
    const newName = prompt('New deck name?')
    const escapedName = $('<div>').text(newName).html() // html escape input
    $('#deckList').append(`<option name="">${escapedName}</option>`)
    $('#mainDeckDisplay').empty()
    $('#lrigDeckDisplay').empty()
    currentDecks.lrig = []
    currentDecks.main = []
    $('#deckList').val(newName)

})

$('#del').on('click', function () {
    let deckId = $('#deckList :selected').attr('value')
    socket.emit('deleteDeck', deckId)
})

$('#exim').on('click', function () {
    const deckName = $('#deckList :selected').text()
    const exportString = JSON.stringify(currentDecks)

    const $nameInput = $('<input type="text" class="nameInput">').val(deckName)
    const $textarea = $('<textarea class="jsonTextarea">').text(exportString)

    popup({
        title: 'Import/Export Deck',
        content: [
            $nameInput,
            $textarea
        ],
        action: 'Save',
        onAction: function () {
            const $this = $(this) // The button that was pressed
            const $popup = $this.closest('.popup')
            const $nameInput = $popup.find('.nameInput')
            const $jsonTextarea = $popup.find('.jsonTextarea')

            const newDeckName = $nameInput.val()
            const deckJSON = $jsonTextarea.text()

            socket.emit('importDeck', {deck: deckJSON, name: newDeckName})
            $this.closest('.popup-background').remove() // Close the popup
        }
    })
})

socket.on('importComplete', function(data) {
    $('#mainDeckDisplay').empty()
    $('#lrigDeckDisplay').empty()
    currentDecks.lrig = []
    currentDecks.main = []
    $('#deckList').append('<option value="importDeck">' + data.name + '</option>')
    $('#deckList').val('importDeck')
    for (let card of data.lrig) {
        currentDecks.lrig.push(parseInt(card.id))
        $('#lrigDeckDisplay').append(cardElementFromData(card))
    }
    for (let card of data.main) {
        currentDecks.main.push(parseInt(card.id))
        $('#mainDeckDisplay').append(cardElementFromData(card))
    }
})

socket.on('deleted', function () {
    $('#deckList :selected').remove()
    $('#mainDeckDisplay').empty()
    $('#lrigDeckDisplay').empty()
    currentDecks.lrig = []
    currentDecks.main = []
    let deckId = $('#deckList :selected').attr('value')
    socket.emit('deckChange', deckId)
})

socket.on('savedDeck', function (data) {
    let deckName = $('#deckList :selected').text()
    $('#deckList :selected').after('<option value="' + data + '">' + deckName + '</option>')
    $('#deckList :selected').remove()
    $('#deckList').val(data)
})

socket.on('loadDeck', function (data) {
    $('#deckList').append('<option value="' + data.id + '">' + data.name + '</option>')
})



function popup (stuff) {
    console.log('hi')
    const $wrapper = $('<div class="popup-background">')
    const $popup = $('<div class="popup">')
    $wrapper.append($popup)
    const $title = $('<h1 class="title">').text(stuff.title || 'Hey!')
    const $content = $('<div class="content">').append(stuff.content)
    const $buttonRow = $('<div class="button-row">')
    $popup.append($title).append($content).append($buttonRow)
    const $cancelButton = $('<button class="cancel">').text(stuff.cancel || 'Cancel')
    const $actionButton = stuff.action ? $('<button class="confirm">').text(stuff.action) : ''
    $buttonRow.append($actionButton).append($cancelButton)

    $cancelButton.on('click', function () {
        $wrapper.remove()
    })
    if (stuff.onAction) $actionButton.on('click', stuff.onAction)

    $('body').append($wrapper)
    return $popup
}
