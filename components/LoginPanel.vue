<template>
	<section class="login-panel">
		<form @submit.prevent="login">
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
}
</style>
