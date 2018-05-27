<template>
	<section class="panel login-panel">
		<form
			class="form login-form"
			@submit.prevent="login"
		>
			<h1>Log In</h1>
			<input
				v-model="loginForm.username"
				type="text"
				placeholder="Username"
			/>
			<input
				v-model="loginForm.password"
				type="password"
				placeholder="Password"
			/>
			<input
				type="submit"
				value="Login"
			/>
		</form>
		<form
			class="form signup-form"
			@submit.prevent="signup"
		>
			<h1>Register</h1>
			<input
				v-model="signupForm.username"
				type="text"
				placeholder="Username"
			/>
			<input
				v-model="signupForm.password"
				type="password"
				placeholder="Password"
			/>
			<input
				type="submit"
				value="Register"
			/>
		</form>
	</section>
</template>

<script>
import axios from 'axios'

export default {
	data () {
		return {
			loginForm: {
				username: '',
				password: ''
			},
			signupForm: {
				username: '',
				password: ''
			}
		}
	},
	methods: {
		login () {
			axios.post('/login', this.loginForm).then(response => {
				this.$emit('login', response.data)
				this.$socket.emit('loadDecks')
			}).catch(err => {
				if (err.response) {
					window.alert(err.response.data)
				} else {
					console.log(err, Object.keys(err))
				}
			})
		},
		signup () {
			axios.post('/signup', this.signupForm).then(response => {
				window.alert(response.data)
			}).catch(err => {
				window.alert(err.response.data)
			})
		},
		loadDecks () {
			this.$socket.emit('loadDecks')
		},
	}
}
</script>

<style>
.login-panel {
	flex: 0 0 auto;
	display: flex;
	justify-content: center;
	align-items: center;
}
.login-panel h1 {
	margin: 0;
}
.login-panel .form {
	width: 200px;
	margin: 10px;
}
.login-panel .form * {
	display: block;
	box-sizing: border-box;
	width: 100%;
}
.login-panel .form input[type="text"] {
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
}
.login-panel .form input[type="password"] {
	border-top: 0;
	border-top-left-radius: 0;
	border-top-right-radius: 0;
}
.login-panel .form input[type="submit"] {
	margin-top: 5px;
}
</style>
