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
            // const data = JSON.parse(response)
            if ($this.is('.login-form')) {
                socket.emit('loadDecks')
                $('.current-user').text()
                $('.current-user').text($('.login-form [name="username"]').val())
                // Hide this panel and show the main ones
                $('.panel.login').hide()
                $('.panel.lobby, .panel.rooms, .builder-button, .logout-button').show()
            } else if ($this.is('.signup-form')) {
                // Just alert, nothing fancy here
                alert('signed up! please log in now')
            } else if ($this.is('.logout-form')) {
                // Tell the server we died
                socket.emit('imDeadKthx')
                // Reset lobby contents
                showRooms() // eslint-disable-line no-undef
                $('.lobby .chat, .lobby .tab-chat').remove()
                // Show login form again
                $('.panel.lobby, .panel.rooms, .builder-button, .logout-button, .panel.builder').hide()
                $('.panel.login').show()
                // Remove username
                $('.current-user').text()
                $submitButton.attr('disabled', false)
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
