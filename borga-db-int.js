'use strict'

const crypto = require('crypto')
const errors = require('./errors')

const users = []

module.exports = function () {

    function getUserIndex(userID) {
        const userIndex = users.findIndex(user => user.id === userID)
        if(!users[userIndex]) return -1

        return userIndex
    }

    function getGroupIndex(userIndex, groupID) {
        const groups = users[userIndex].groups
        const groupIndex = groups.findIndex(group => group.id === groupID)
        if(!groups[groupIndex]) return -1

        return groupIndex
    }

    function createGroup(userID, name, description) {
        const userIndex = getUserIndex(userID)
        if (userIndex === -1) return Promise.reject(errors.INVALID_USER)
        const uuid = crypto.randomUUID()
        const group = {
            id: uuid,
            name: name,
            description: description,
            games: []
        }
        users[userIndex].groups.push(group)
        return Promise.resolve(group)
    }

    function getGroups(userID) {
        const userIndex = getUserIndex(userID)
        if (userIndex === -1) return Promise.reject(errors.INVALID_USER)

        return Promise.resolve(users[userIndex].groups)
    }

    function getGroup(userID, groupID) {
        const userIndex = getUserIndex(userID)
        if (userIndex === -1) return Promise.reject(errors.INVALID_USER)

        const group = users[userIndex].groups.find(group => group.id === groupID)
        return group ? Promise.resolve(group) : Promise.reject(errors.MISSING_DATA)
    }

    function updateGroup(userID, groupID, newName, newDescription) {
        const userIndex = getUserIndex(userID)
        if (userIndex === -1) return Promise.reject(errors.INVALID_USER)

        const groupIndex = getGroupIndex(userIndex, groupID)
        if(groupIndex === -1) return Promise.reject(errors.MISSING_DATA)

        users[userIndex].groups[groupIndex].name = newName
        users[userIndex].groups[groupIndex].description = newDescription

        return Promise.resolve()
    }

    function deleteGroup(userID, groupID) {
        const userIndex = getUserIndex(userID)
        if (userIndex === -1) return Promise.reject(errors.INVALID_USER)

        const groupIndex = getGroupIndex(userIndex, groupID)
        if(groupIndex === -1) return Promise.reject(errors.MISSING_DATA)

        users[userIndex].groups.splice(groupIndex,1)
        return Promise.resolve()
    }

    function addGameToGroup(userID, groupID, game) {
        const userIndex = getUserIndex(userID)
        if (userIndex === -1) return Promise.reject(errors.INVALID_USER)

        const groupIndex = getGroupIndex(userIndex, groupID)
        if(groupIndex === -1) return Promise.reject(errors.MISSING_DATA)

        users[userIndex].groups[groupIndex].games.push(game)
        return Promise.resolve(game)
    }

    function deleteGameFromGroup(userID, groupID, game) {
        const userIndex = getUserIndex(userID)
        if (userIndex === -1) return Promise.reject(errors.INVALID_USER)

        const groupIndex = getGroupIndex(userIndex, groupID)
        if(groupIndex === -1) return Promise.reject(errors.MISSING_DATA)

        const foundGroup = users[userIndex].groups[groupIndex]

        const gameIndex = foundGroup.games.findIndex(g => g.id === game.id)
        if(gameIndex === -1) return Promise.reject(errors.MISSING_DATA)

        users[userIndex].groups[groupIndex].games.splice(gameIndex, 1)
        return Promise.resolve()
    }

    function createUser(username, password) {
        return getUser(username).then(user => {
            if(user) return Promise.reject(errors.INVALID_USER)
            const uuid = crypto.randomUUID()
            const newUser = {
                username: username,
                password: password,
                id: uuid,
                groups: []
            }
            users.push(newUser)
            return Promise.resolve(newUser)
        }).catch(err => {
            return Promise.reject(err)
        })
    }

    function getUser(username) {
        const userIndex = users.findIndex(user => user.username === username)
        return Promise.resolve(users[userIndex])
    }

    function checkDatabase() {
        return Promise.resolve(true)
    }

    function createUsersIndex() {
        return Promise.resolve(true)
    }

    return {
        getUser: getUser,
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
}
