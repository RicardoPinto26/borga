'use strict'

const express = require('express')
const session = require('express-session')
const passport = require('passport')

passport.serializeUser((userInfo, done) => { done(null, userInfo) })
passport.deserializeUser((userInfo, done) => { done(null, userInfo) })

module.exports = function (es_spec, db, docs) {

    const gamesData = require('./board-games-data')
    const borgaData = require(db)
    const borgaServices = require('./borga-services')(gamesData, borgaData(es_spec))
    const borgaAPI = require('./borga-web-api')(borgaServices)
    const borgaSite = require('./borga-web-site')(borgaServices, docs)

    const app = express()
    app.use(session({
        secret: 'isel-ipw',
        resave: false,
        saveUninitialized: false
    }))
    app.use(passport.initialize())
    app.use(passport.session())

    app.set('view engine', 'hbs')

    app.use('/favicon.ico',
        express.static('static-files/favicon.ico'))
    app.use('/public', express.static('static-files'))

    app.use('/api', borgaAPI)
    app.use('/', borgaSite)

    return app
}