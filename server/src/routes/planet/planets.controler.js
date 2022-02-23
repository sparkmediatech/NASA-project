const{ getAllplanets} = require('../../models/planet.model')

 
async function httpGetAllPlanets(req, res){
   return res.status(200).json(await getAllplanets());
};




module.exports = {
     httpGetAllPlanets
}