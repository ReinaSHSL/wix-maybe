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
        console.log('[addMember]', member)
        console.log(this.members)
        this.members.push(member)
        if (this.members.length === 1) {
            console.log('Making owner')
            this.owner = member
        }
    }

    removeMember (id) {
        console.log('[removeMember]')
        const index = this.members.findIndex(u => u.id === id)
        this.members.splice(index, 1)

        if (id === this.ownerId && this.members.length) {
            this.owner = this.members[0]
        }
        console.log(this.members, this.membersSorted)
    }

    set owner (user) {
        this.ownerId = user.id
    }

    get owner () {
        return this.members.find(u => u.id === this.ownerId)
    }

    get hasPassword () {
        return this.password ? true : false
    }

    get membersSorted () {
        // Array.from() returns a new array so we don't modify this.members with
        // the map function
        return Array.from(this.members).map(u => {
            if (u.id === this.ownerId) u.owner = true
            return u
        })
    }

    toJSON () {
        return {
            name: this.name,
            id: this.id,
            members: this.members,
            owner: this.owner,
            hasPassword: this.hasPassword,
            messages: this.messages
        }
    }

    inspect () {
        return this.toJSON()
    }
}
