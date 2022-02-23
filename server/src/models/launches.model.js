const launchesDatabase = require('./launches.mongo');
const planets = require('./planet.mongo');
const axios = require('axios');


const defaultFlightNumber = 100;


const SPACEX_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
    console.log('downloading lauch data')
 const response = await axios.post(SPACEX_URL, {
        
    query: {},
    options:{
        pagination: false,
        populate:[
            {
                path: 'rocket',
                select: {
                    name: 1
                }
            },
            {
              path: 'payloads',
              select:{
                  'customers': 1
              }
            }
        ]
    }


    });

    if(response.status != 200){
        console.log('Problem downloading launch data')

        throw new Error('Launch data download failed')
    };

    const launchDocs = response.data.docs;
    for(const lauchDoc of launchDocs){
        const payloads = lauchDoc['payloads'];
        const customers = payloads.flatMap((payload)=>{
            return payload['customers'];
        })

        const launch = {
            flightNumber: lauchDoc['flight_number'],
            mission: lauchDoc['name'],
            rocket: lauchDoc['rocket']['name'],
            launchDate: lauchDoc['date_local'],
            upcoming: lauchDoc['upcoming'],
            success: lauchDoc['success'],
            customers: customers
        };

        console.log(`${launch.flightNumber} ${launch.mission}`);

        await saveLaunch(launch)
    }
}

async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber:1,
        focket: 'Falcon 1',
        mission: 'FalconSat',
    });

    if(firstLaunch){
        console.log('Launch data already loaded')
    
    }else{
       await populateLaunches()
    }
};

async function findLaunch(filter){
    return await launchesDatabase.findOne(filter);
}

async function existLaunchWithId(launchId){
    return await findLaunch({
        flightNumber: launchId
    });
};


async function getLatestFlightNumber (){
    const latestLaunch = await launchesDatabase
    .findOne()
    .sort('-flightNumber');
    if(!latestLaunch){
       return defaultFlightNumber
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit){
    return await launchesDatabase.find({}, {
        '_id': 0, '__v': 0
    })
    .sort({flightNumber: 1})
    .skip(skip)
    .limit(limit);
};

async function saveLaunch(launch){

    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
};


async function scheduleNewLaunch(launch){

      const planet = await planets.findOne({
       kepler_name: launch.target
    });
    if(!planet){
        throw new Error('No matching planet was found')
    }


        const newFlightNuber  = await getLatestFlightNumber() + 1;
        const newLaunch = Object.assign(launch, {
            success: true,
            upcoming: true,
            customers: ['Zero to Mastery', 'NASA'],
            flightNumber: newFlightNuber
        });
    
    await saveLaunch(newLaunch)

}



async function abortLaunchById(launchId){
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false,
    });
    
    return aborted.acknowledged === true && aborted.modifiedCount === 1;
  
}



module.exports = {
    loadLaunchData,
    existLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
     abortLaunchById
}