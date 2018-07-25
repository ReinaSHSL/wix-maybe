const log = require('another-logger')('dbinit')
const r = require('rethinkdb')
const dbConfig = require('./config.js').rethinkdb

const dbName = 'batorume'
const dbTables = [
	'decks',
	'selectors'
]

r.connect(dbConfig, function (err, conn) {
	if (err) return log.error.trace(err)
	log.info(`RethinkDB connection on port ${dbConfig.port}.`)
	r.dbList().run(conn, (err, dbs) => {
		if (err) return log.error.trace(err)
		if (dbs.indexOf(dbName) < 0) {
			r.dbCreate(dbName).run(conn,(err, result) => {
				if (err) return log.error.trace(err)
				log.success(`Database '${dbName}' created.`)
				checkTables()
			})
		} else {
			log.info(`Database '${dbName}' found.`)
			checkTables()
		}

		// welcome to async hell
		function checkTables () {
			r.db(dbName).tableList().run(conn, (err, tables) => {
				if (err) return log.error.trace(err)
				! function checkTable (i = 0) {
					const name = dbTables[i]
					if (!name) {
						log.info('Done, exiting.')
						process.exit()
					}
					if (tables.indexOf(name) < 0) {
						r.db(dbName).tableCreate(name).run(conn, (err) => {
							if (err) return log.error.trace(err)
							log.success(`Table '${name}' created.`)
							checkTable(++i)
						})
					} else {
						log.info(`Table '${name}' found.`)
						checkTable(++i)
					}
				}()
			})
		}
	})
})
