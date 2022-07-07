'use strict';

const fetch = require('node-fetch')
const request = require('supertest')

const server = require('../../../borga-server')
const {add} = require("nodemon/lib/rules");

const es_spec = {
    url: 'http://localhost:9200/'
};

const guest_token = 'test'

test('Confirm database is running', async () => {
    const response = await fetch(`${es_spec.url}_cat/health`)
    expect(response.status).toBe(200)
})

describe('Integration tests', () => {

    const app = server(es_spec, guest_token)

    afterAll(async () => {
        await fetch(
            es_spec.url + guest_token,
            {method: 'DELETE'}
        )
    })
    let groupID = '0'
    test('Get no groups', async () => {
        const response = await request(app)
            .get('/api/groups/')
            .set('Authorization', 'Bearer ' + guest_token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)

        expect(response.status).toBe(404); // or see above
        expect(response.body).toBeTruthy();
        expect(response.body).toEqual({description: "No groups found for the user."});
    });

    test('Add a Group', async () => {
        const group = {
            name: "aGroup with Catan",
            description: "aGroup with Catan's Description"
        }

        const addGroupResponse = await request(app)
            .post('/api/groups/')
            .set('Authorization', 'Bearer ' + guest_token)
            .set('Accept', 'application/json')
            .send(group)
            .expect('Content-Type', /json/)
            .expect(201);


        expect(addGroupResponse.body).toBeTruthy()
        expect(addGroupResponse.body.name).toEqual(group.name)
        expect(addGroupResponse.body.description).toEqual(group.description)

        const listGroupResponse = await request(app)
            .get('/api/groups/')
            .set('Authorization', 'Bearer ' + guest_token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)

        expect(listGroupResponse.body).toBeTruthy()
        expect(listGroupResponse.body).toHaveLength(1)
        expect(listGroupResponse.body[0].id).toEqual(addGroupResponse.body.id)
        expect(listGroupResponse.body[0].name).toEqual(addGroupResponse.body.name)
        expect(listGroupResponse.body[0].description).toEqual(addGroupResponse.body.description)
        expect(listGroupResponse.body[0].games).toEqual(addGroupResponse.body.games)

        groupID = addGroupResponse.body.id
    })
    test('add Catan to the group', async () => {
        const game = {
            gameID: 'OIXt3DmJU0'
        }

        const addGameResponse = await request(app)
            .post('/api/groups/' + groupID + '/games')
            .set('Authorization', 'Bearer ' + guest_token)
            .set('Accept', 'application/json')
            .send(game)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(addGameResponse.body).toBeTruthy()
        expect(addGameResponse.body.id).toEqual(game.gameID)
        expect(addGameResponse.body.name).toEqual("Catan")

        const listGameResponse = await request(app)
            .get('/api/groups/')
            .set('Authorization', 'Bearer ' + guest_token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)

        expect(listGameResponse.body).toBeTruthy()
        expect(listGameResponse.body[0].games[0]).toEqual({id: game.gameID, name: 'Catan'})
    })
    test('Change the group\'s name and description', async () => {
        const newGroupND = {
            name: "aGroup with Catan 2.0",
            description: "aGroup with Catan's Description 2.0"
        }

        const ChangeGroupResponse = await request(app)
            .put('/api/groups/' + groupID)
            .set('Authorization', 'Bearer ' + guest_token)
            .set('Accept', 'application/json')
            .send(newGroupND)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(ChangeGroupResponse.body).toBeTruthy()
        expect(ChangeGroupResponse.body.name).toEqual(newGroupND.name)
        expect(ChangeGroupResponse.body.description).toEqual(newGroupND.description)

        const listChangeGroupResponse = await request(app)
            .get('/api/groups/')
            .set('Authorization', 'Bearer ' + guest_token)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)

        expect(listChangeGroupResponse.body).toBeTruthy()
        expect(listChangeGroupResponse.body).toHaveLength(1)
        expect(listChangeGroupResponse.body[0].id).toEqual(groupID)
        expect(listChangeGroupResponse.body[0].name).toEqual(newGroupND.name)
        expect(listChangeGroupResponse.body[0].description).toEqual(newGroupND.description)
    })
    test('delete Catan from the group', async () => {
        const game = {
            gameID: 'OIXt3DmJU0'
        }

        const deleteGameResponse = await request(app)
            .delete('/api/groups/' + groupID + '/games/' + game.gameID)
            .set('Authorization', 'Bearer ' + guest_token)
            .set('Accept', 'application/json')
            .expect(204);
    })
    test('delete the group', async () => {
        const deleteGroupResponse = await request(app)
            .delete('/api/groups/' + groupID)
            .set('Authorization', 'Bearer ' + guest_token)
            .set('Accept', 'application/json')
            .expect(204);
    })
})

