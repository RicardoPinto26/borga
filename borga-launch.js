'use strict'

const default_port = 8888
const port = process.env.PORT || default_port

const default_db = 'INT'
const db_choice = process.argv[2] || default_db

const config = require('./borga-config')(db_choice)

const es_spec = {
    url: config.devl_es_url
}

const app = require('./borga-server')(es_spec, config.db, config.docs)

app.listen(port, () => console.log('Borga listening at http://localhost:' + port))