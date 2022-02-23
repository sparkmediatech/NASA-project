const mongoose = require('mongoose');



const MONGO_URL = process.env.MONGO_URL;

//use event emitters to trigger certain behaviour such as when server is connected and when there is error
mongoose.connection.once('open', ()=>{
   console.log('MongoDB connection ready!') 
});

mongoose.connection.on('error', (error)=>{
    console.err(error)
});



async function mongoConnect(){
await mongoose.connect(MONGO_URL);

};

//create mongo disconnect function to apply in the test file
async function mongoDisconnect(){
 await mongoose.disconnect();

};

module.exports = {
    mongoConnect,
    mongoDisconnect
}