const request = require('supertest');
const app = require('../../app'); //imported the express app module
const { loadPlanetsData } = require('../../models/planet.model');
const {mongoConnect, mongoDisconnect} = require('../../services/mongo');



describe('Launches API', ()=>{
    //started the mongodb connection before testing
    beforeAll(async ()=>{
         await mongoConnect();
         await loadPlanetsData()
    });
    //should disconnect mongodb connection after testing
  afterAll(async () => {
    await mongoDisconnect();
});

//Test for get request using jest and supertest libraries
describe('Test GET /launches', ()=>{
    test('It should respond with 200 successs', async ()=>{
        const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200)

    });
});

//test for post request
describe('Test POST /launches', ()=>{

    const completeLaunchData = {
            mission: 'USA Enterprice',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'January 4, 2028'
    };

    const launchDataWithoutDate = {
            mission: 'USA Enterprice',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
           
    };

    const launchDataWithInvalidDate = {
        mission: 'USA Enterprice',
        rocket: 'NCC 1701-D',
        target: 'Kepler-62 f',
        launchDate: 'zoot'
    }

    test('It should respond with 201 success', async ()=>{
        const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        expect(201);
        const requestDate = new Date(completeLaunchData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();
        expect(responseDate).toBe(requestDate)

        expect(response.body).toMatchObject(launchDataWithoutDate);
    });
    test('It should catch missing required properties', async ()=>{
         const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        expect(400);

        expect(response.body).toStrictEqual({
             error: "Missing required launch property"
        });
       
    });
    test('It should catch invalid dates', async ()=>{
        const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        expect(400);

        expect(response.body).toStrictEqual({
             error: 'Invalid launch date'
        });

    });
});




})

