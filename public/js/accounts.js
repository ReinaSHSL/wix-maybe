/* globals $ */

$('.login-form, .signup-form').on('submit', function (e) {
    e.preventDefault()
    const $this = $(this)
    const $submitButton = $this.find('input[type="submit"]')
    // Disable to avoid duping request - enable when we get a response
    $submitButton.attr('disabled', true)
    $.ajax({
        url: $this.attr('action'),
        type: $this.attr('method'),
        data: $this.serialize(),
        success: function (response) {
            // const data = JSON.parse(response)
            if ($this.is('.login-form')) {
                alert('logged in!')
                $('.current-user').text()
                $submitButton.attr('disabled', false)
                $('.current-user').text($('.login-form [name="username"]').val())
            } else {
                alert('signed up! please log in now')
                $submitButton.attr('disabled', false)
            }
        },
        error: function (response) {
            // const data = JSON.parse(response)
            if ($this.is('.login-form')) {
                alert('failed to log in...\n' + response.responseText)
                $submitButton.attr('disabled', false)
            } else {
                alert('failed to sign up...\n' + response.responseText)
                $submitButton.attr('disabled', false)
            }
        }
    })
})
