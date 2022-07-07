'use strict'

const errors = require('./errors')

function checkAuthorization(auth) {
    if (!auth) return false
    const splitAuth = auth.split(' ')
    if (!splitAuth[1]) return false
    const userID = splitAuth[1]
    if (userID === undefined) return false
    return userID
}

module.exports = function (gamesData, borgaData) {
    if (!gamesData || !borgaData)
        return Promise.reject(errors.INTERNAL_ERROR("gamesData and/or borgaData didn't load correctly"))

    return {
        checkAndGetUser: checkAndGetUser,
        getGames: getGames,
        getGame: getGame,
        getGameDetails: getGameDetails,
        createGroup: createGroup,
        getGroups: getGroups,
        getGroup: getGroup,
        updateGroup: updateGroup,
        deleteGroup: deleteGroup,
        addGameToGroup: addGameToGroup,
        deleteGameFromGroup: deleteGameFromGroup,
        createUser: createUser,
        checkDatabase: checkDatabase,
        createUsersIndex: createUsersIndex
    }
/*
    async function checkAndGetUser(username, password) {
        if (!username || !password) {
            throw (errors.MISSING_DATA)
        }
        const user = await borgaData.getUser(username)
        if (user === errors.INVALID_USER || user.password !== password) {
            throw errors.INVALID_USER
        }
        return user
    }
*/
    function checkAndGetUser(username, password) {
        if (!username || !password) {
            return Promise.reject(errors.MISSING_DATA)
        }
        return borgaData.getUser(username).then(user => {

            if (user === errors.INVALID_USER || user.password !== password) {
                return Promise.reject(errors.INVALID_USER)
            }
            return user
        }).catch(() => {
            return Promise.reject(errors.INVALID_USER)
        })
    }

    function getGames(skip, limit) {
        skip = skip ? Number(skip) : 0
        limit = limit ? Number(limit) : 10

        if (isNaN(skip) || isNaN(limit)) return Promise.reject(errors.INVALID_DATA)

        return gamesData.getGames(skip, limit)
    }

    function getGame(name) {
        name = name ? String(name) : undefined
        if (name === undefined) return Promise.reject(errors.INVALID_DATA)
        return gamesData.getGame(name)
    }

    function getGameDetails(id) {
        id = id ? String(id) : undefined
        if (id === undefined) return Promise.reject(errors.INVALID_DATA)
        return gamesData.getGameDetails(id)
    }

    function getGroups(auth) {
        const userID = checkAuthorization(auth)
        if (!userID) return Promise.reject(errors.NO_USER)
        return borgaData.getGroups(userID)
    }

    function getGroup(auth, groupID) {
        const userID = checkAuthorization(auth)
        if (!userID) return Promise.reject(errors.NO_USER)

        groupID = groupID ? String(groupID) : undefined
        if (groupID === undefined) return Promise.reject(errors.INVALID_DATA)
        return borgaData.getGroup(userID, groupID)
    }

    function createGroup(auth, name, description) {
        const userID = checkAuthorization(auth)
        if (!userID) return Promise.reject(errors.NO_USER)

        name = name ? String(name) : undefined
        description = description ? String(description) : undefined

        if (name === undefined || description === undefined) return Promise.reject(errors.INVALID_DATA)

        return borgaData.createGroup(userID, name, description)
    }

    function updateGroup(auth, groupID, newName, newDescription) {
        const userID = checkAuthorization(auth)
        if (!userID) return Promise.reject(errors.NO_USER)


        newName = newName ? String(newName) : undefined
        newDescription = newDescription ? String(newDescription) : undefined
        groupID = groupID ? String(groupID) : undefined
        if (newName === undefined || newDescription === undefined || groupID === undefined) return Promise.reject(errors.INVALID_DATA)

        return borgaData.updateGroup(userID, groupID, newName, newDescription)
    }

    function deleteGroup(auth, groupID) {
        const userID = checkAuthorization(auth)
        if (!userID) return Promise.reject(errors.NO_USER)

        groupID = groupID ? String(groupID) : undefined
        if (groupID === undefined) return Promise.reject(errors.INVALID_DATA)

        return borgaData.deleteGroup(userID, groupID)
    }

    function addGameToGroup(auth, groupID, gameID) {
        const userID = checkAuthorization(auth)
        if (!userID) return Promise.reject(errors.NO_USER)

        groupID = groupID ? String(groupID) : undefined
        gameID = gameID ? String(gameID) : undefined

        if (groupID === undefined || gameID === undefined) return Promise.reject(errors.INVALID_DATA)

        return gamesData.getGameByID(gameID).then(game => {
            return borgaData.addGameToGroup(userID, groupID, game)
        })
    }

    function deleteGameFromGroup(auth, groupID, gameID) {
        const userID = checkAuthorization(auth)
        if (!userID) return Promise.reject(errors.NO_USER)

        groupID = groupID ? String(groupID) : undefined
        gameID = gameID ? String(gameID) : undefined

        if (groupID === undefined || gameID === undefined) return Promise.reject(errors.INVALID_DATA)

        return gamesData.getGameByID(gameID).then(game => {
            return borgaData.deleteGameFromGroup(userID, groupID, game)
        }).catch(err => {
            return Promise.reject(err)
        })
    }

    function createUser(username, password) {
        username = username ? String(username) : undefined
        password = password ? String(password) : undefined

        if (username === undefined || password === undefined) return Promise.reject(errors.INVALID_DATA)

        return borgaData.createUser(username, password)
    }

    function checkDatabase() {
        return borgaData.checkDatabase()
    }
    function createUsersIndex() {
        return borgaData.createUsersIndex()
    }
}