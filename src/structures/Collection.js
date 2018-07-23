class Collection extends Map {
	constructor (baseClass) {
		super()
		this.baseClass = baseClass
	}

	add (obj) {
		if (obj.id == null) throw new TypeError('Missing id property')
		if (!(obj instanceof this.baseClass)) throw new TypeError('Object is not an instance of the proper base class')
		this.set(obj.id, obj)
	}

	remove (obj) {
		if (!this.get(obj.id)) return null
		return this.delete(obj.id)
	}

	find (test) {
		for (let value of this.values()) {
			if (test(value)) return test
		}
		return null
	}

	filter (test) {
		let result = []
		for (let value of this.values()) {
			if (test(value)) result.push(value)
		}
		return result
	}

	toJSON () {
		return Array.from(this.values())
	}
}

module.exports = Collection
