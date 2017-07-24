/* globals $ */

$('.login-form, signup-form').on('submit', function (e) {
    e.preventDefault()
    const $this = $(this)
    $.ajax({
        url: $this.attr('action'),
        type: $this.attr('method'),
        data: $this.serialize(),
        success: function () {
            if ($this.is('.login-form')) return loginSuccess()
            signupSuccess()
        }
    })
})

function signupSuccess () {
    alert('signed up!')
}

function loginSuccess () {
    alert('logged in!')
}
