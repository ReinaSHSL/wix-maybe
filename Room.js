const {escapeHTML} = require('./util.js')

module.exports = class Room {
    constructor (name, password, id) {
        this.name = name
        this.password = password
        this.id = id
        this.messages = []
        // Future code
        // while (this.id == null || rooms.map(r => r.id).indexOf(this.id) > -1) {
        //     this.id++
        // }
        this.id += '' // this shouldn't be necessary but we add it for safety
        this.members = []
        this.ownerId = undefined
    }

    addMember (member) {
        member = {id: member.id, username: member.username, ready: member.ready || false}
        console.log('[addMember]', member, '->|', this.members)
        this.members.push(member)
        if (this.members.length === 1) {
            console.log('Making owner')
            this.owner = member
        }
    }

    removeMember (id) {
        console.log('[removeMember]', id)
        const index = this.members.findIndex(u => u.id === id)
        this.members.splice(index, 1)

        if (id === this.ownerId && this.members.length) {
            this.owner = this.members[0]
        }
        console.log(this.members, this.membersList)
    }

    memberDeck (id, deck) {
        const index = this.members.findIndex(u => u.id === id)
        this.members[index].deck = deck
    }

    set owner (user) {
        this.ownerId = user.id
    }

    get owner () {
        return this.members.find(u => u.id === this.ownerId)
    }

    get memberList () {
        return this.members.map(u => {
            if (u.id === this.ownerId) u.owner = true
            return u
        }).sort((u1, u2) => {
            if (u1.owner && !u2.owner) return -1
            if (u2.owner && !u1.owner) return 1
            return u1.username.localeCompare(u2.username)
        })
    }

    toJSON () {
        return {
            name: this.name,
            safeName: escapeHTML(this.name),
            id: this.id,
            members: this.memberList,
            owner: this.owner,
            hasPassword: this.password ? true : false,
        }
    }

    withMessages () {
        let json = this.toJSON()
        json.messages = this.messages
        return json
    }

    inspect () {
        return this.toJSON()
    }
}
