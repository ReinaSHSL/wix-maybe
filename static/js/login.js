/* globals $, socket */

$('.login-form, .signup-form, .logout-form').on('submit', function (e) {
    e.preventDefault()
    const $this = $(this)
    const $submitButton = $this.find('input[type="submit"]')
    // Disable to avoid duping request - enable when we get a response
    $submitButton.attr('disabled', true)
    $.ajax({
        url: $this.attr('action'),
        type: $this.attr('method'),
        data: $this.serialize(),
        success: function (response) { // eslint-disable-line no-unused-vars
            if ($this.is('.login-form')) {
                socket.emit('loadDecks')
                $('.current-user').text()
                $('.current-user').text(response.username)
                $('.current-user').attr('data-user-id', response.id)
                // Hide this panel and show the main ones
                $('.panel.login').hide()
                $('.panel.lobby, .panel.rooms, .builder-button, .logout-button').show()
            } else if ($this.is('.signup-form')) {
                // Just alert, nothing fancy here
                alert('signed up! please log in now')
            } else if ($this.is('.logout-form')) {
                // Tell the server we died
                window.location.reload()
            }
            $submitButton.attr('disabled', false)
        },
        error: function (response) {
            // const data = JSON.parse(response)
            if ($this.is('.login-form')) {
                alert('Failed to log in...\n' + response.responseText)
            } else if ($this.is('.signup-form')) {
                alert('Failed to sign up...\n' + response.responseText)
            }

            $submitButton.attr('disabled', false)
        }
    })
})

window.addEventListener('load', checkLogin)
function checkLogin () {
    socket.emit('checkLogin')
}

socket.on('loggedIn', function () {
    $('.panel.login').hide()
    $('.panel.lobby, .panel.rooms, .builder-button, .logout-button').show()
})

socket.on('logOut', function () {
    $('#mainDeckDisplay').empty()
    $('#lrigDeckDisplay').empty()
    $builderButton.text('Open Deck Builder') // eslint-disable-line no-undef
})
