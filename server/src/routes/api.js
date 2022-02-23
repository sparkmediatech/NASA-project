//versioning our api

const express = require('express');


const planetsRouter = require('./planet/planet.router');
const launchersRouter = require('./launches/launches.routers');

const api = express.Router();


api.use(planetsRouter);
api.use(launchersRouter);


module.exports = api;