module.exports = function (app, r, conn) {

//Register
    app.post('/signup', function (req, res) {
    // If they left off information, error back
        if (!req.body.username || !req.body.password) {
            return res.status(400).send('Invalid details!')
        }
        const username = req.body.username
        const unhashedPassword = req.body.password
        let hashedPassword = 5381
        for (let i = 0; i < unhashedPassword.length; i++) {
            let char = unhashedPassword.charCodeAt(i)
            hashedPassword = ((hashedPassword << 5) + hashedPassword) + char /* hash * 33 + c */
        }

        // Let's see if we have this username
        r.table('selectors').filter(r.row('username').eq(username)).run(conn, function (err, cursor) {
            if (err) {
                console.log(err)
                return res.status(500).send('Server error; check the console')
            }
            cursor.toArray(function (err, result) {
                if (err) {
                    console.log(err)
                    return res.status(500).send('Server error; check the console')
                }
                // We do already have this username, rip
                if (result[0]) return res.status(400).send('Username in use')

                // Get the highest ID
                r.table('selectors').max('id').getField('id').run(conn, function (err, id) {
                    if (err && err.name === 'ReqlNonExistenceError') {
                    // There are no users yet, so we'll start at 0
                        id = 0
                    } else if (err) {
                    // We actually fucked something up
                        console.log(err)
                        return res.status(500).send('Server error; check the console')
                    } else {
                    // Increment the alst user's ID to get the next one
                        id++
                    }
                    const user = {
                        id: id,
                        username: username,
                        password: hashedPassword
                    }

                    // Insert the user into the table now
                    r.table('selectors').insert(user).run(conn, function (err) {
                        if (err) {
                            console.log(err)
                            return res.status(500).send('Server error; check the console')
                        }
                        // Finally, we did it!
                        res.status(200).send('Registered')
                    })
                })
            })
        })
    })

    //Login
    app.post('/login', function (req, res) {
        if (!req.body.username || !req.body.password) {
            return res.status(400).send('Insert username and password')
        }

        const username = req.body.username
        const unhashedPassword = req.body.password

        let hashedPassword = 5381
        for (let i = 0; i < unhashedPassword.length; i++) {
            let char = unhashedPassword.charCodeAt(i)
            hashedPassword = ((hashedPassword << 5) + hashedPassword) + char /* hash * 33 + c */
        }

        r.table('selectors').filter(r.row('username').eq(username)).run(conn, function (err, cursor) {
            if (err) {
                console.log(err)
                return res.status(500).send('Server error; check the console')
            }
            cursor.toArray(function (err, result) {
                if (err) {
                    console.log(err)
                    return res.status(500).send('Server error; check the console')
                }
                const user = result[0]
                if (result[1]) {
                    console.log("Go clean up your database, there's a duplicated user here")
                    console.log(user)
                    console.log(result[1])
                }
                if (!user || hashedPassword !== user.password) {
                    return res.status(400).send('Incorrect or invalid credentials')
                }
                if (result[0].loggedIn) {
                    return res.status(400).send('This account is already logged in')
                }
                r.table('selectors').get(result[0].id).update({loggedIn:true}).run(conn, function (err, logIn) {
                    if (err) console.log(err)
                    if (logIn) {
                        req.session.user = user // This stores the user's session for later
                        return res.status(200).send('Logged in')
                    }
                })
            })
        })
    })

     //Logout
    app.post('/logout', function (req, res) {
        if (!req.session.user) {
            return
        }
        res.status(200).send('good fucking job')
    })
}
