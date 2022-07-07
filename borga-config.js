'use strict'

module.exports = (db_choice) => {
    let dbc
    let docs
    switch(db_choice) {
        case 'ES':
            dbc = './borga-db'
            docs = './docs/borga-api-spec-es.yaml'
            break
        case 'INT':
            dbc = './borga-db-int'
            docs = './docs/borga-api-spec-int.yaml'
            break
        default:
            console.log("Invalid Database chosen. Using Internal Database.")
            dbc = './borga-db-int'
            docs = './docs/borga-api-spec-int.yaml'
            break
    }
    return {
        devl_es_url: process.env.BONSAI_URL ? process.env.BONSAI_URL + '/' : 'http://localhost:9200/',
        db: dbc,
        docs: docs
    }
}
