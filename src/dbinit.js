const r = require('rethinkdb')
const dbConfig = require('./dbConfig')

const dbName = 'batorume'
const dbTables = [
    'decks',
    'selectors'
]

r.connect(dbConfig, function (err, conn) {
    if (err) return console.log(err)
    console.log(`[db-init] RethinkDB connection on port ${dbConfig.port}.`)
    r.dbList().run(conn, (err, dbs) => {
        if (err) return console.log(err)
        if (dbs.indexOf(dbName) < 0) {
            r.dbCreate(dbName).run(conn,(err, result) => {
                if (err) return console.log(err)
                console.log(`[db-init] Database '${dbName}' created.`)
                checkTables()
            })
        } else {
            console.log(`[db-init] Database '${dbName}' found.`)
            checkTables()
        }

        // welcome to async hell
        function checkTables () {
            r.db(dbName).tableList().run(conn, (err, tables) => {
                if (err) return console.log(err)
                ! function checkTable (i = 0) {
                    const name = dbTables[i]
                    if (!name) {
                        console.log('[db-init] Done, exiting.')
                        process.exit()
                    }
                    if (tables.indexOf(name) < 0) {
                        r.db(dbName).tableCreate(name).run(conn, (err) => {
                            if (err) return console.log(err)
                            console.log(`[db-init] Table '${name}' created.`)
                            checkTable(++i)
                        })
                    } else {
                        console.log(`[db-init] Table '${name}' found.`)
                        checkTable(++i)
                    }
                }()
            })
        }
    })
})
