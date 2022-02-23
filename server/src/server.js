//creating the server
const http = require('http');
require('dotenv').config();


const app = require('./app');

const {mongoConnect} = require('./services/mongo')

const {loadPlanetsData} = require('./models/planet.model');
const {loadLaunchData} = require('./models/launches.model')

const PORT = process.env.PORT || 5000;



const server = http.createServer(app);


async function startServer(){
await mongoConnect();
await loadPlanetsData();
await loadLaunchData();

server.listen(PORT, ()=>{
    console.log(`listening on port ${PORT}...`)
});
};

startServer();
