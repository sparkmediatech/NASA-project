const fs = require ('fs');
const { parse } = require('csv-parse');
const path = require('path');
const Planets = require('./planet.mongo');


function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

//create new Promise()

function loadPlanetsData(){

return new Promise ((resolve, reject)=>{

 fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepla_data.csv')).pipe(parse({
    comment: '#',
    columns: true
}))
.on('data', async (data)=>{
    if(isHabitablePlanet(data)){
        savePlanet(data)
    }
   
}).on('error', (err)=>{
console.log(err);
reject(err);
})
.on('end', async ()=>{
    const countPlanentsFOund = ( await getAllplanets()).length

    console.log(`${ countPlanentsFOund} habitable planets found`);
    resolve();
});
})
}

async function getAllplanets(){
    return await Planets.find({})
    //return habitablePlanets
}

async function savePlanet(planet){
    try{
        //console.log(planet.kepler_name)
         await Planets.updateOne({
            kepler_name: planet.kepler_name
        }, {
             kepler_name: planet.kepler_name
        }, {
            upsert: true
        });
    }catch(err){
        console.error(`Could not save planet ${err}`)

    }
    
}
module.exports = {
    loadPlanetsData,
  getAllplanets,
}
