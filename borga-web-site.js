'use strict'

const express = require('express')
// Using YAML openAPI file
const YAML = require('yamljs')

const swaggerUi = require("swagger-ui-express")


module.exports = function (borgaServices, docs) {
    if (!borgaServices)
        throw "Invalid argument for borgaServices"

    const swaggerDocument = YAML.load(docs)

    const router = express.Router()

    router.use(express.urlencoded({extended: true}))

    router.get('', Home)
    // Login page
    router.get('/authenticate', getLoginPage)

    // Login action
    router.post('/login', doLogin)

    // Logout action
    router.post('/logout', doLogout)

    router.get('/CreateNewUser', getNewUserPage)
    router.post('/newUser', createNewUser)

    router.get('/failed', getFailedPage)

    router.get('/groups', getGroups)
    router.get('/groups/:groupID', getGroupsDetails)
    router.get('/groups/:groupID/edit', getEditGroupPage)
    router.post('/groups/:groupID/edited', editGroup)
    router.get('/popularGames', popularGames)
    router.get('/gamesByName', gamesByName)
    router.get('/newGroup', newGroup)
    router.get('/selectGroupToAddGame/:gameID', selectGroupToAddGame)
    router.post('/addGameToGroup/:groupID/:gameID', addGameToGroup)
    router.get('/game/:gameID', getGameDetails)
    router.post('/group', createGroup)

    router.get('/about', aboutMe)

    router.use('/api-docs', swaggerUi.serve)
    router.get('/api-docs', swaggerUi.setup(swaggerDocument))

    router.get('*', notFoundPage)

    return router


    function Home(req, rsp) {
        rsp.render('Home', {username: req.user ? req.user.username : undefined})
    }

    function notFoundPage(req, rsp) {
        rsp.render('notFound', {username: req.user ? req.user.username : undefined})
    }

    function aboutMe(req, rsp) {
        rsp.render('aboutMe', {username: req.user ? req.user.username : undefined})
    }

    function getNewUserPage(req, res) {
        res.render('newUser', {username: req.user ? req.user.username : undefined})
    }

    function getLoginPage(req, res) {
        res.render('login', {username: req.user ? req.user.username : undefined})
    }

    function getEditGroupPage(req, res) {
        if(!req.user) {
            rsp.render('failedX',{motive:'listing all the groups. You are not signed in', username: req.user ? req.user.username : undefined})
            return
        }
        const groupID = req.params.groupID
        res.render('editGroup', {username: req.user ? req.user.username : undefined, groupID})
    }

    function editGroup(req, res) {
        if(!req.user) {
            rsp.render('failedX',{motive:'listing all the groups. You are not signed in', username: req.user ? req.user.username : undefined})
            return
        }
        const userID = String(req.user.id)
        const groupID = String(req.params.groupID)
        const name = String(req.body.name)
        const description = String(req.body.description)

        if(!name || !description) {
            res.render('editGroup', {username: req.user ? req.user.username : undefined, groupID, error: true})
            return
        }

        res.render("editedGroup", {userID, groupID, name, description, username: req.user ? req.user.username : undefined})
    }

    function createNewUser(req, res) {
        const username = String(req.body.username)
        const password = String(req.body.password)

        if(!username || !password) {
            res.render('newUser', {username: req.user ? req.user.username : undefined, error400: true})
            return
        }

        borgaServices.createUser(username, password).then(user => {
            req.login({username: user.username, id: user.id}, err => {
                if (err) console.log('LOGIN ERROR', err)
            })
            res.redirect('/')
        }).catch(e => {
            switch(e.code) {
                case 403:
                    res.render('newUser', {username: req.user ? req.user.username : undefined, error403: true})
                    break
                default:
                    res.render('failedX', {motive: "creating a new user", username: req.user ? req.user.username : undefined})
                    break
            }
        })
    }

    function getFailedPage(req, res) {
        res.render('failedX', {motive: req.motive ? req.motive : 'that we could not determine.', username: req.user ? req.user.username : undefined})
    }

    function doLogin(req, res) {
        const username = req.body.username
        const password = req.body.password

        borgaServices.checkAndGetUser(username, password).then(user => {
            req.login({username: user.username, id: user.id}, err => {
                if (err) console.log('LOGIN ERROR', err)
                res.redirect('/')
            })
        }).catch (() => {
            res.render('failedX', {motive: "logging in. Wrong username/password.", username: req.user ? req.user.username : undefined})
        })
    }

    function doLogout(req, res) {
        req.logout()
        res.redirect('/')
    }

    function getGroups(req, rsp) {
        if(!req.user) {
            rsp.render('failedX',{motive:'listing all the groups. You are not signed in'})
            return
        }
        const userID = "Bearer " + req.user.id
        borgaServices.getGroups(userID).then(groups => {
            rsp.render('groups', {
                groups: groups.map((j, idx) => {
                    return {group: j, beginRow: idx % 2 === 0, endRow: idx % 2 === 1 || idx === groups.length - 1}
                }),
                username: req.user ? req.user.username : undefined,
                userID
            })
        }).catch(e => {
            switch (e.code) {
                case 401:
                    rsp.status(401).json({description: "Missing bearer token. The user is not authenticated."})
                    break
                case 403:
                    rsp.status(403).json({description: "User not found."})
                    break
                case 404:
                    rsp.render('groups', {username: req.user ? req.user.username : undefined})
                    break
                case 500:
                    rsp.status(500).json({description: "getGroups Service Server Error: " + e.description})
                    break
                default:
                    rsp.status(500).json({description: "getGroups Service Server Error: " + e})
                    break
            }
        })
    }

    function getGroupsDetails(req, rsp) {
        if(!req.user) {
            rsp.render('failedX',{motive:'listing all the groups. You are not signed in', username: req.user ? req.user.username : undefined})
            return
        }
        let groupID = req.params.groupID
        const userID = "Bearer " + req.user.id
        borgaServices.getGroup(userID, groupID).then(group => {
            rsp.render('groupDetails', {group, username: req.user ? req.user.username : undefined, userID})
        }).catch(e => {
            switch (e.code) {
                case 400:
                    rsp.status(400).json({description: "Invalid ID supplied"})
                    break
                case 401:
                    rsp.status(401).json({description: "Missing bearer token. The user is not authenticated."})
                    break
                case 403:
                    rsp.status(403).json({description: "User not found."})
                    break
                case 404:
                    rsp.status(404).json({description: "Group with that ID not found"})
                    break
                case 500:
                    rsp.status(500).json({description: "getGroup Service Server Error: " + e.description})
                    break
                default:
                    rsp.status(500).json({description: "getGroup Service Server Error: " + e})
                    break
            }
        })
    }

    function selectGroupToAddGame(req, rsp) {
        if(!req.user) {
            rsp.render('failedX',{motive:'listing all the groups. You are not signed in', username: req.user ? req.user.username : undefined})
            return
        }
        const userID = "Bearer " + req.user.id
        const gameID = req.params.gameID
        borgaServices.getGroups(userID).then(groups => {
            rsp.render('selectGroupToAddGame', {
                groups: groups.map((j, idx) => {
                    return {
                        group: {...j, ...{gameID: String(gameID)}},
                        beginRow: idx % 2 === 0,
                        endRow: idx % 2 === 1 || idx === groups.length - 1
                    }
                }),
                username: req.user ? req.user.username : undefined
            })
        }).catch(e => {
            switch (e.code) {
                case 403:
                    rsp.status(403).json({description: "User not found."})
                    break
                case 404:
                    rsp.status(404).json({description: "Group/Game with that ID not found."})
                    break
                case 500:
                    rsp.status(500).json({description: "getGroups Service Server Error: " + e.description})
                    break
                default:
                    rsp.status(500).json({description: "getGroups Service Server Error: " + e})
                    break
            }
        })
    }

    function addGameToGroup(req, rsp) {
        if(!req.user) {
            rsp.render('failedX',{motive:'listing all the groups. You are not signed in', username: req.user ? req.user.username : undefined})
            return
        }
        const groupID = req.params.groupID
        const gameID = req.params.gameID
        const userID = "Bearer " + req.user.id
        borgaServices.addGameToGroup(userID, groupID, gameID).then(() => {
            rsp.redirect('/groups/' + groupID)
        }).catch(e => {
            switch (e.code) {
                case 400:
                    rsp.status(400).json({description: "Invalid group/game ID provided."})
                    break
                case 401:
                    rsp.status(401).json({description: "Missing bearer token. The user is not authenticated."})
                    break
                case 403:
                    rsp.status(403).json({description: "User not found."})
                    break
                case 404:
                    rsp.status(404).json({description: "Group/Game with that ID not found."})
                    break
                case 502:
                    rsp.render('failedX',{motive:'with the Board Games Atlas API', username: req.user ? req.user.username : undefined})
                    break
                case 500:
                    rsp.status(500).json({description: "deleteGroup Service Server Error: " + e.description})
                    break
                default:
                    rsp.status(500).json({description: "deleteGroup Service Server Error: " + e})
                    break
            }
        })
    }

    function newGroup(req, rsp) {
        if(!req.user) {
            rsp.render('failedX',{motive:'creating a new group. You are not signed in', username: req.user ? req.user.username : undefined})
            return
        }
        rsp.render('newGroup', {username: req.user ? req.user.username : undefined})
    }

    function createGroup(req, rsp) {
        if(!req.user) {
            rsp.render('failedX',{motive:'listing all the groups. You are not signed in', username: req.user ? req.user.username : undefined})
            return
        }

        const name = String(req.body.name)
        const description = String(req.body.description)

        if(!name || !description) {
            rsp.render('newGroup', {username: req.user ? req.user.username : undefined, error: true})
            return
        }

        const userID = "Bearer " + req.user.id
        borgaServices.createGroup(userID, name, description).then(newGroup => {
            rsp.redirect('/groups/' + newGroup.id)
        }).catch(e => {
            switch (e.code) {
                case 400:
                    rsp.status(400).json({description: "Invalid name and/or description provided"})
                    break
                case 401:
                    rsp.status(401).json({description: "Missing bearer token. The user is not authenticated."})
                    break
                case 403:
                    rsp.status(403).json({description: "User not found."})
                    break
                case 500:
                    rsp.status(500).json({description: "createGroup Service Server Error: " + e.description})
                    break
                default:
                    rsp.status(500).json({description: "createGroup Service Server Error: " + e})
                    break
            }
        })
    }

    function popularGames(req, rsp) {
        borgaServices.getGames(0, req.query.limit).then(games => {
            rsp.render('popularGames', {
                games: games.map((j, idx) => {
                    return {game: j, beginRow: idx % 2 === 0, endRow: idx % 2 === 1 || idx === games.length - 1}
                }),
                username: req.user ? req.user.username : undefined
            })
        }).catch(e => {
            switch (e.code) {
                case 400:
                    rsp.status(400).json({description: "Invalid skip/limit query"})
                    break
                default:
                    rsp.render('failedX',{motive:'with the Board Games Atlas API', username: req.user ? req.user.username : undefined})
                    break
            }
        })
    }

    function gamesByName(req, rsp) {
        const name = req.query.search
        borgaServices.getGame(name).then(game => {
            rsp.render('singleGame', {game, username: req.user ? req.user.username : undefined})
        }).catch(e => {
            switch (e.code) {
                case 404:
                    rsp.render('failedX',{motive:'finding a game with that name', username: req.user ? req.user.username : undefined})
                    break
                default:
                    rsp.render('failedX',{motive:'with the Board Games Atlas API', username: req.user ? req.user.username : undefined})
                    break
            }
        })
    }

    function getGameDetails(req, rsp) {
        const username = req.user ? req.user.username : undefined
        borgaServices.getGameDetails(req.params.gameID).then(game => {
            rsp.render('singleGame', {username, game})
        }).catch(e => {
            switch (e.code) {
                case 404:
                    rsp.status(404).json({description: "No game found for the provided id"})
                    break
                default:
                    rsp.render('failedX',{motive:'with the Board Games Atlas API', username: req.user ? req.user.username : undefined})
                    break
            }
        })
    }


}


