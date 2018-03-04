<template>
	<tr
		class="message"
		:class="cssClass"
	>
		<td class="timestamp">{{time}}</td>
		<td v-if="message.type === 'normal'" class="author">
			<colored-username
				:user="{username: message.author}"
			/>
		</td>
		<td v-if="message.type === 'normal'" class="content">{{message.content}}</td>
		<td v-if="message.type === 'join'" class="decoration">--&gt;</td>
		<td v-if="message.type === 'join'" class="content">
			<colored-username
				:user="{username: message.username}"
			/>
			has joined.
		</td>
		<td v-if="message.type === 'leave'" class="decoration">&lt;--</td>
		<td v-if="message.type === 'leave'" class="content">
			<colored-username
				:user="{username: message.username}"
			/>
			has left.
		</td>
		<td v-if="message.type === 'ownerChange'" class="decoration">---</td>
		<td v-if="message.type === 'ownerChange'" class="content">
			<colored-username
				:user="{username: message.username}"
			/>
			is now the owner.
		</td>
	</tr>
</template>

<script>
import ColoredUsername from '~/components/ColoredUsername.vue'

export default {
	props: ['message'],
	computed: {
		time () {
			return new Date(this.message.timestamp).toTimeString().substr(0, 5)
		},
		cssClass () {
			switch (this.message.type) {
				case 'normal':
					return 'user-message'
				case 'join':
					return 'join-message'
				case 'leave':
					return 'leave-message'
				case 'ownerChange':
					return 'owner-change-message'
			}
		}
	},
	components: {
		ColoredUsername,
	}
}
</script>

<style>
.message:hover {
	background: #F7F7F7;
}
.message .timestamp,
.message .author,
.message .decoration,
.message .content {
	padding: 1px 5px;
	display: table-cell;
	vertical-align: top;
}
.message .timestamp {
	white-space: nowrap;
	opacity: .7;
	padding-right: 0;
}
.message .author,
.message .decoration {
	white-space: nowrap;
	border-right: 1px solid #DDD;
	text-align: right;
}
.message .content {
	width: 100%;
}
.message:not(.user-message) .content { color: #666 }
.join-message .decoration { color: green }
.leave-message .decoration { color: red }

</style>

