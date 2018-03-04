<template>
	<tr class="message">
		<td class="timestamp">{{time}}</td>
		<td class="author">
			<colored-username
				v-if="message.type === 'normal'"
				:user="{username: message.author}"
			/>
		</td>
		<td class="content">{{message.content}}</td>
	</tr>
</template>

<script>
import ColoredUsername from '~/components/ColoredUsername.vue'

export default {
	props: ['message'],
	computed: {
		time () {
			return new Date(this.message.timestamp).toTimeString().substr(0, 5)
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
.message .timestamp, .message .author, .message .content {
	padding: 1px 5px;
	display: table-cell;
	vertical-align: top;
}
.message .timestamp {
	white-space: nowrap;
	opacity: .7;
	padding-right: 0;
}
.message .author {
	white-space: nowrap;
	border-right: 1px solid #DDD;
	text-align: right;
}
.message .content {
	width: 100%;
}
.message.system .content { color: #666 }
.message.join .author { color: green }
.message.leave .author { color: red }

</style>

