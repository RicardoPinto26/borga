const config = require('./borga-config')

const es_spec = {
    url: config.devl_es_url
}

const gamesData = require('./board-games-data')
const borgaData = require('./borga-db')
const borgaServices = require('./borga-services')(gamesData, borgaData(es_spec))

async function main() {
    console.log("Starting to populate")
    const user_a47673 = await borgaServices.createUser("a47673", "password")

    const group_a47673_JF = await borgaServices.createGroup(
        'Bearer ' + user_a47673.id,
        "Jogos Favoritos",
        "Este é um grupo que contém os meus jogos favoritos"
    )

    const group_a47673_JO = await borgaServices.createGroup(
        'Bearer ' + user_a47673.id,
        "Jogos que Odeio",
        "Este é um grupo que contém os jogos que eu odeio"
    )

    await borgaServices.addGameToGroup(
        'Bearer ' + user_a47673.id,
        group_a47673_JF.id,
        'OIXt3DmJU0'
    )

    await borgaServices.addGameToGroup(
        'Bearer ' + user_a47673.id,
        group_a47673_JF.id,
        'fG5Ax8PA7n'
    )

    await borgaServices.addGameToGroup(
        'Bearer ' + user_a47673.id,
        group_a47673_JO.id,
        'TAAifFP590'
    )

    await borgaServices.addGameToGroup(
        'Bearer ' + user_a47673.id,
        group_a47673_JO.id,
        'XygpMq1XMY'
    )

    const user_francisco = await borgaServices.createUser("francisco", "francisco2001")
    const group_francisco_JF = await borgaServices.createGroup(
        'Bearer ' + user_francisco.id,
        "Jogos Favoritos",
        "Este é um grupo que contém os meus jogos favoritos"
    )

    const group_francisco_JO = await borgaServices.createGroup(
        'Bearer ' + user_francisco.id,
        "Jogos que Odeio",
        "Este é um grupo que contém os jogos que eu odeio"
    )

    await borgaServices.addGameToGroup(
        'Bearer ' + user_francisco.id,
        group_francisco_JF.id,
        'Ad9NDUFxmt'
    )

    await borgaServices.addGameToGroup(
        'Bearer ' + user_francisco.id,
        group_francisco_JF.id,
        'fG5Ax8PA7n'
    )

    await borgaServices.addGameToGroup(
        'Bearer ' + user_francisco.id,
        group_francisco_JO.id,
        'BxzQUBho7e'
    )

    await borgaServices.addGameToGroup(
        'Bearer ' + user_francisco.id,
        group_francisco_JO.id,
        'ERmIvVd9gA'
    )
    console.log("Done populating.")
}

main().catch(() => {
    console.log("Either the Database is already populated, or it isn't running.")
})