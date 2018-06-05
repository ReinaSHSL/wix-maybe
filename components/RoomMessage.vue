<template>
	<tr
		class="message"
		:class="cssClass"
	>
		<td class="timestamp">{{time}}</td>
		<template v-if="message.type === 'normal'">
			<td class="author">
				<colored-username
					:user="message.author"
				/>
			</td>
			<td class="content">{{message.content}}</td>
		</template>
		<template v-if="message.type === 'join'">
			<td class="decoration">--&gt;</td>
			<td class="content">
				<colored-username
					:user="{username: message.username}"
				/>
				has joined.
			</td>
		</template>
		<template v-if="message.type === 'leave'">
			<td class="decoration">&lt;--</td>
			<td class="content">
				<colored-username
					:user="{username: message.username}"
				/>
				has left.
			</td>
		</template>
		<template v-if="message.type === 'ownerChange'">
			<td class="decoration">---</td>
			<td class="content">
				<colored-username
					:user="{username: message.username}"
				/>
				is now the owner.
			</td>
		</template>
	</tr>
</template>

<script>
import ColoredUsername from '~/components/ColoredUsername.vue'

export default {
	props: ['message', 'compact'],
	computed: {
		time () {
			return new Date(this.message.timestamp).toTimeString().substr(0, 5)
		},
		cssClass () {
			let type
			switch (this.message.type) {
				case 'normal':
					type = 'user-message'
					break
				case 'join':
					type = 'join-message'
					break
				case 'leave':
					type = 'leave-message'
					break
				case 'ownerChange':
					type = 'owner-change-message'
					break
			}
			return [type, {compact: this.compact}]
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

.message.compact {
	display: block;
}

</style>

