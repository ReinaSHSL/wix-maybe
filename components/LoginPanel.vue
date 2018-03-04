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
			this.$parent.login(this.loginForm.username, this.loginForm.password)
		},
		signup () {
			this.$parent.signup(this.signupForm.username, this.signupForm.password)
		}
	}
}
</script>

<style>
.login-panel {
	align-self: center;
	flex: 0 0 auto;
	display: flex;
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
.login-panel .form input[type="password"] {
	border-top: 0;
}
.login-panel .form input[type="submit"] {
	margin-top: 3px;
}
</style>
