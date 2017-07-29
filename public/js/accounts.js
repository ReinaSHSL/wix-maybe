/* globals $ */

$('.login-form, signup-form').on('submit', function (e) {
    e.preventDefault()
    const $this = $(this)
    $this.find('input[type="submit"]').attr('disabled', true)
    $.ajax({
        url: $this.attr('action'),
        type: $this.attr('method'),
        data: $this.serialize(),
        success: function (response) {
            const data = JSON.parse(response)
            if ($this.is('.login-form')) {
                loginSuccess(data)
            } else {
                signupSuccess(data)
            }
        },
        error: function (response) {
            const data = JSON.parse(response)
            if ($this.is('.login-form')) {
                loginFail(data)
            } else {
                signupFail(data)
            }
        }
    })
})

function signupSuccess (data) {
    alert('signed up!')
}
function signupFail (data) {
    // TODO
}

function loginSuccess (data) {
    alert('logged in!')
    $('.current-user').text()
}
function loginFail (data) {
    // TODO
}
