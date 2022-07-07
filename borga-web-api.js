'use strict'

const express = require('express')
const errors = require('./errors')

const guestUser = require("./borga-config").guestUser

module.exports = function (borgaServices) {
    if (!borgaServices)
        throw errors.INTERNAL_ERROR("no borgaServices")

    function checkDatabase() {
        return borgaServices.checkDatabase()
    }
    function createUsersIndex() {
        return borgaServices.createUsersIndex()
    }

    function getGames(req, rsp) {
        borgaServices.getGames(req.query.skip, req.query.limit)
            .then(games => {
                rsp.json(games)
            })
            .catch(e => {
                switch (e.code) {
                    case 400:
                        rsp.status(400).json({description: "Invalid skip/limit query"})
                        break
                    default:
                        rsp.status(502).json({description: "Board Games Atlas API is not responding"})
                        break
                }
            })
    }

    function getGame(req, rsp) {
        borgaServices.getGame(req.params.name)
            .then(game => {
                rsp.json(game)
            })
            .catch(e => {
                switch (e.code) {
                    case 404:
                        rsp.status(404).json({description: "No game found for the provided name"})
                        break
                    default:
                        rsp.status(502).json({description: "Board Games Atlas API is not responding"})
                        break
                }
            })
    }

    function getGameDetails(req, rsp) {
        borgaServices.getGameDetails(req.params.id)
            .then(gameDetails => {
                rsp.json(gameDetails)
            })
            .catch(e => {
                switch (e.code) {
                    case 404:
                        rsp.status(404).json({description: "No game found for the provided name"})
                        break
                    default:
                        rsp.status(502).json({description: "Board Games Atlas API is not responding"})
                        break
                }
            })
    }

    function getGroups(req, rsp) {
        borgaServices.getGroups(req.get('Authorization'))
            .then(groups => {
                rsp.json(groups)
            })
            .catch(e => {
                switch (e.code) {
                    case 401:
                        rsp.status(401).json({description: "Missing bearer token. The user is not authenticated."})
                        break
                    case 403:
                        rsp.status(403).json({description: "User not found."})
                        break
                    case 404:
                        rsp.status(404).json({description: "No groups found for the user."})
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

    function getGroup(req, rsp) {
        borgaServices.getGroup(req.get('Authorization'), req.params.groupID)
            .then(group => {
                rsp.json(group)
            })
            .catch(e => {
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

    function createGroup(req, rsp) {
        borgaServices.createGroup(req.get('Authorization'), req.body.name, req.body.description)
            .then(group => {
                rsp.status(201).json(group)
            })
            .catch(e => {
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

    function updateGroup(req, rsp) {
        borgaServices.updateGroup(req.get('Authorization'), req.params.groupID, req.body.name, req.body.description)
            .then(() => {
                rsp.status(204).json()
            })
            .catch(e => {
                switch (e.code) {
                    case 400:
                        rsp.status(400).json({description: "Invalid groupID, name, and/or description provided."})
                        break
                    case 401:
                        rsp.status(401).json({description: "Missing bearer token. The user is not authenticated."})
                        break
                    case 403:
                        rsp.status(403).json({description: "User not found."})
                        break
                    case 404:
                        rsp.status(404).json({description: "Group with that ID not found,"})
                        break
                    case 500:
                        rsp.status(500).json({description: "updateGroup Service Server Error: " + e.description})
                        break
                    default:
                        rsp.status(500).json({description: "updateGroup Service Server Error: " + e})
                        break
                }
            })
    }


    function deleteGroup(req, rsp) {
        borgaServices.deleteGroup(req.get('Authorization'), req.params.groupID)
            .then(() => {
                rsp.status(204).json()
            })
            .catch(e => {
                switch (e.code) {
                    case 400:
                        rsp.status(400).json({description: "Invalid groupID."})
                        break
                    case 401:
                        rsp.status(401).json({description: "Missing bearer token. The user is not authenticated."})
                        break
                    case 403:
                        rsp.status(403).json({description: "User not found."})
                        break
                    case 404:
                        rsp.status(404).json({description: "Group with that ID not found."})
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

    function addGameToGroup(req, rsp) {
        borgaServices.addGameToGroup(req.get('Authorization'), req.params.groupID, req.body.gameID)
            .then(game => {
                rsp.status(201).json(game)
            })
            .catch(e => {
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
                        rsp.status(502).json({description: "Board Games Atlas API is not responding."})
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

    function deleteGameFromGroup(req, rsp) {
        borgaServices.deleteGameFromGroup(req.get('Authorization'), req.params.groupID, req.params.gameID)
            .then(() => {
                rsp.status(204).json()
            })
            .catch(e => {
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
                    case 500:
                        rsp.status(500).json({description: "deleteGroup Service Server Error: " + e.description})
                        break
                    default:
                        rsp.status(500).json({description: "deleteGroup Service Server Error: " + e})
                        break
                }
            })
    }

    function createUser(req, rsp) {
        const username = req.body.username
        const password = req.body.password

        borgaServices.createUser(username, password)
            .then(newUser => {
                rsp.status(201).json(newUser)
            })
            .catch(e => {
                switch (e.code) {
                    case 400:
                        rsp.status(400).json({description: "Invalid name/password provided."})
                        break
                    case 403:
                        rsp.status(400).json({description: "Username already in use."})
                        break
                    case 500:
                        rsp.status(500).json({description: "createUser Service Server Error: " + e.description})
                        break
                    default:
                        rsp.status(500).json({description: "createUser Service Server Error: " + e})
                        break
                }

            })
    }

    const router = express.Router()

    router.use(express.json())

    // games
    router.get('/games', getGames)       // Get the list of the most popular games
    router.get('/games/:name', getGame)  // Search game by name
    router.get('/games/details/:id', getGameDetails)  // Get the details of a game by ID

    // groups
    router.get('/groups', getGroups)                                        // Gets all groups
    router.get('/groups/:groupID', getGroup)                                // Search group by name
    router.post('/groups', createGroup)                                     // Creates a group
    router.put('/groups/:groupID', updateGroup)                             // Updates a group
    router.delete('/groups/:groupID', deleteGroup)                          // Deletes a group
    router.post('/groups/:groupID/games', addGameToGroup)                   // Adds a game to a group
    router.delete('/groups/:groupID/games/:gameID', deleteGameFromGroup)    // Deletes a game from a group

    //users
    router.post('/users', createUser)    //Adds a user

    checkDatabase().then(ok => {
        if (!ok) {
            console.log("There was an error connecting to the database. Please make sure that the ElasticSearch DB is running.")
            process.exit(500)
        }
        createUsersIndex().then(ok => {
            if (!ok) {
                console.log("There was an error connecting to the database. Please make sure that the ElasticSearch DB is running.")
                process.exit(500)
            }
        })
    })
    return router
}