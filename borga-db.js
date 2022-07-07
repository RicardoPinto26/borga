'use strict'

const crypto = require('crypto')
const errors = require('./errors')
const fetch = require('node-fetch')

module.exports = function (es_spec) {
    const baseUrl = es_spec.url

    function checkUser(userID) {
        return fetch(baseUrl + 'users/_doc/' + userID)
            .then(res => {
                return res.json()
            }).then(obj => {
                return (obj.found)
            }).catch(err => {
                return false
            })
    }

    function createGroup(userID, name, description) {
        return checkUser(userID).then(valid => {
            if (!valid) return Promise.reject(errors.INVALID_USER)
            const group = {
                name: name,
                description: description,
                games: []
            }
            return fetch(baseUrl + userID + '/_doc?refresh=wait_for', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(group)
            }).then(res => {
                return res.json()
            }).then(obj => {
                return Promise.resolve({
                    id: obj._id,
                    name: group.name,
                    description: group.description,
                    games: group.games
                })
            }).catch(() => {
                return Promise.reject(errors.INTERNAL_ERROR)
            })
        }).catch(err => {
            return Promise.reject(err)
        })
    }

    function getGroups(userID) {
        return checkUser(userID).then(valid => {
            if (!valid) return Promise.reject(errors.INVALID_USER)
            return fetch(baseUrl + userID + '/_search')
                .then(res => {
                    if (res.status === 404) return Promise.reject(errors.MISSING_DATA)
                    return res.json()
                }).then(obj => {
                    return obj.hits.hits.map(hit => {
                        return {
                            id: hit._id,
                            name: hit._source.name,
                            description: hit._source.description,
                            games: hit._source.games

                        }
                    })
                }).catch(err => {
                    return Promise.reject(err)
                })
        }).catch(err => {
            return Promise.reject(err)
        })
    }

    function getGroup(userID, groupID) {
        return checkUser(userID).then(valid => {
            if (!valid) return Promise.reject(errors.INVALID_USER)
            return fetch(baseUrl + userID + '/_doc/' + groupID)
                .then(res => {
                    if (res.status === 404) return Promise.reject(errors.MISSING_DATA)
                    return res.json()
                }).then(obj => {
                    const group = obj._source
                    return {
                        id: groupID,
                        name: group.name,
                        description: group.description,
                        games: group.games
                    }
                }).catch(err => {
                    return Promise.reject(err)
                })
        }).catch(err => {
            return Promise.reject(err)
        })
    }

    function updateGroup(userID, groupID, newName, newDescription) {
        return checkUser(userID).then(valid => {
            if (!valid) return Promise.reject(errors.INVALID_USER)
            return fetch(baseUrl + userID + '/_update/' + groupID + '?refresh=wait_for', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    script: {
                        source: 'ctx._source.name = params.name ctx._source.description = params.description',
                        lang: 'painless',
                        params: {
                            name: newName,
                            description: newDescription
                        }
                    }
                })
            }).then(res => {
                return res.json()
            }).then(obj => {
                return {
                    name: newName,
                    description: newDescription
                }
            }).catch(() => {
                return Promise.reject(errors.INTERNAL_ERROR)
            })
        }).catch(err => {
            return Promise.reject(err)
        })
    }

    function deleteGroup(userID, groupID) {
        return checkUser(userID).then(valid => {
            if (!valid) return Promise.reject(errors.INVALID_USER)
            return fetch(baseUrl + userID + '/_doc/' + groupID + '?refresh=wait_for', {
                method: 'DELETE'
            })
                .then(res => {
                    if (res.status === 404) return Promise.reject(errors.MISSING_DATA)
                    return res.json()
                }).then(obj => {
                    return obj
                }).catch(err => {
                    return Promise.reject(err)
                })
        }).catch(err => {
            return Promise.reject(err)
        })
    }

    function addGameToGroup(userID, groupID, game) {
        return checkUser(userID).then(valid => {
            if (!valid) return Promise.reject(errors.INVALID_USER)
            return fetch(baseUrl + userID + '/_update/' + groupID + '?refresh=wait_for', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    script: {
                        source: 'ctx._source.games.add(params.game)',
                        lang: 'painless',
                        params: {
                            game: game
                        }
                    }
                })
            }).then(res => {
                if (res.status === 404) return Promise.reject(errors.MISSING_DATA)
                return game
            }).catch(err => {
                return Promise.reject(err)
            })
        }).catch(err => {
            return Promise.reject(err)
        })
    }

    function deleteGameFromGroup(userID, groupID, game) {
        return checkUser(userID).then(valid => {
            if (!valid) return Promise.reject(errors.INVALID_USER)
            return fetch(baseUrl + userID + '/_update/' + groupID + '?refresh=wait_for', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    script: {
                        source: 'if (ctx._source.games.contains(params.game)) { ctx._source.games.remove(ctx._source.games.indexOf(params.game)) } else { ctx.op = \'none\' }',
                        lang: 'painless',
                        params: {
                            game: game
                        }
                    }
                })
            }).then(res => {
                if (res.status === 404) return Promise.reject(errors.MISSING_DATA)
                return res.json()
            }).then(obj => {
                if (obj.result === 'noop') return Promise.reject(errors.MISSING_DATA)
                return obj
            }).catch(err => {
                return Promise.reject(err)
            })
        }).catch(err => {
            return Promise.reject(err)
        })
    }

    function createUser(username, password) {
        return getUser(username).then(user => {
            return checkUser(user.id).then(valid => {

                if (valid) return Promise.reject(errors.INVALID_USER)
                const uuid = crypto.randomUUID()
                const newUser = {
                    username: username,
                    password: password,
                    id: uuid
                }

                return fetch(baseUrl + 'users/_doc/' + uuid + '?refresh=wait_for', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newUser)
                }).then(res => {
                    return res.json()
                }).then(res => {
                    console.log("CreateUser Response:")
                    console.log(res)
                    return fetch(baseUrl + newUser.id, {
                        method: 'PUT'
                    }).then(response => {
                        console.log("CreateIndex Response:")
                        console.log(response)
                        return newUser
                    }).catch(err => {
                        return Promise.reject(errors.INTERNAL_ERROR("Elastic Search API is not responding: " + err))
                    })

                }).catch(err => {
                    return Promise.reject(errors.INTERNAL_ERROR("Elastic Search API is not responding: " + err))
                })
            })
        }).catch(err => {
            return Promise.reject(err)
        })
    }

    function getUser(username) {
        return fetch(baseUrl + 'users/_search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: {
                    term: {
                        username: username
                    }
                }
            })
        }).then(res => {
            return res.json()
        }).then(obj => {
            if (obj.status || obj.hits.total.value === 0) return errors.INVALID_USER
            else return obj.hits.hits[0]._source
        }).catch(err => {
            return Promise.reject(err)
        })
    }

    function checkDatabase() {
        return fetch(baseUrl)
            .then(res => {
                return res.status === 200
            }).catch(() => {
                return false
            })
    }

    function createUsersIndex() {
        return fetch(baseUrl + 'users', {
            method: 'PUT'
        }).then(res => {
            return res.json()
        }).then(obj => {
            console.log("createUsersIndex() response:")
            console.log(obj)
            return true
        }).catch(() => {
            return false
        })
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
