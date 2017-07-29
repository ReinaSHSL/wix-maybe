/* globals $ */

$('.login-form, .signup-form').on('submit', function (e) {
    e.preventDefault()
    const $this = $(this)
    $this.find('input[type="submit"]').attr('disabled', true)
    $.ajax({
        url: $this.attr('action'),
        type: $this.attr('method'),
        data: $this.serialize(),
        success: function (response) {
            // const data = JSON.parse(response)
            if ($this.is('.login-form')) {
                alert('logged in!')
                $('.current-user').text()
            } else {
                alert('signed up! please log in now')
            }
        },
        error: function (response) {
            // const data = JSON.parse(response)
            if ($this.is('.login-form')) {
                alert('failed to log in...')
            } else {
                alert('failed to sign up...')
            }
        }
    })
})
