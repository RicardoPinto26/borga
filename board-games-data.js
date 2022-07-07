'use strict';

const fetch = require('node-fetch')
const errors = require('./errors')
const CLIENT_ID = process.env.ATLAS_CLIENT_ID
const fp = require('./part1')

module.exports = {
    getGames: getGames,
    getGame: getGame,
    getGameByID: getGameByID,
    getGameDetails
}

function getGames(skip, limit) {
    return fetch('https://api.boardgameatlas.com/api/search?order_by=popularity&ascending=false&client_id=' + CLIENT_ID + '&limit=' + limit + '&skip=' + skip)
        .then(res => {
            return res.json()
        })
        .then(gamesInfo => {
            return gamesInfo.games
        })
        .then(games => {
            return fp.filterPropertiesN(["id", "name", "image_url"], games)
        })
}

function getGame(name) {
    return fetch('https://api.boardgameatlas.com/api/search?name=' + name + '&client_id=' + CLIENT_ID)
        .then(res => {
            return res.json()
        })
        .then(gamesInfo => {
            return gamesInfo.games[0]
        })
        .then(game => {
            if (!game) return Promise.reject(errors.MISSING_DATA)
            return fp.filterProperties(["id", "name", "description", "url", "image_url", "mechanics", "categories"], game)
        })
        .then(game => {
            return getGameMechanics(game.mechanics)
                .then(fullMechanics => {
                    return getGameCategories(game.categories)
                        .then(fullCategories => {
                            return {
                                id: game.id,
                                name: game.name,
                                description: game.description,
                                url: game.url,
                                image_url: game.image_url,
                                mechanics: fullMechanics.map(mech => {
                                    return {name: mech.name}
                                }),
                                categories: fullCategories.map(cat => {
                                    return {name: cat.name}
                                })
                            }
                        })
                })

        })
        .catch(() => {
            return Promise.reject(errors.MISSING_DATA)
        })
}

function getGameByID(id) {
    return fetch('https://api.boardgameatlas.com/api/search?ids=' + id + '&client_id=' + CLIENT_ID)
        .then(res => {
            return res.json()
        })
        .then(gamesInfo => {
            return gamesInfo.games[0]
        })
        .then(game => {
            return fp.filterProperties(["id", "name", "image_url"], game)
        })
        .catch(() => {
            return Promise.reject(errors.MISSING_DATA)
        })
}

function matchMechanics(mecIDs, mecCom) {
    let intMec = []
    for (let i = 0; i < mecIDs.length; i++) {
        for (let j = 0; j < mecCom.length; j++) {
            if (mecIDs[i].id === mecCom[j].id) intMec.push(mecCom[j])
        }
    }
    return intMec
}

function matchCategories(catIDs, catCom) {
    let intCat = []
    for (let i = 0; i < catIDs.length; i++) {
        for (let j = 0; j < catCom.length; j++) {
            if (catIDs[i].id === catCom[j].id) intCat.push(catCom[j])
        }
    }
    return intCat
}

function getGameMechanics(myMechanics) {
    return fetch('https://api.boardgameatlas.com/api/game/mechanics?client_id=' + CLIENT_ID)
        .then(res => {
            return res.json()
        })
        .then(mechanics => {
            return mechanics.mechanics
        })
        .then(mechanics => {
            return matchMechanics(myMechanics, mechanics)
        })
}

function getGameCategories(myCategories) {
    return fetch('https://api.boardgameatlas.com/api/game/categories?client_id=' + CLIENT_ID)
        .then(res => {
            return res.json()
        })
        .then(categories => {
            return categories.categories
        })
        .then(categories => {
            return matchCategories(myCategories, categories)
        })
}

function getGameDetails(id) {
    return fetch('https://api.boardgameatlas.com/api/search?ids=' + id + '&client_id=' + CLIENT_ID)
        .then(res => {
            return res.json()
        })
        .then(gamesInfo => {
            return gamesInfo.games[0]
        })
        .then(game => {
            return fp.filterProperties(["id", "name", "description", "url", "image_url", "mechanics", "categories"], game)
        })
        .then(game => {
            return getGameMechanics(game.mechanics)
                .then(fullMechanics => {
                    return getGameCategories(game.categories)
                        .then(fullCategories => {
                            return {
                                id: game.id,
                                name: game.name,
                                description: game.description,
                                url: game.url,
                                image_url: game.image_url,
                                mechanics: fullMechanics.map(mech => {
                                    return {name: mech.name}
                                }),
                                categories: fullCategories.map(cat => {
                                    return {name: cat.name}
                                })
                            }
                        })
                })

        })
        .catch(() => {
            return Promise.reject(errors.MISSING_DATA)
        })
}