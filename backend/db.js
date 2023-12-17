const mongoose = require('mongoose');
const mongoURI = 'mongodb://localhost:27017/inotebook?readPreference=primary&appname=MongoDB%20Compass&ssl=false'

// Function to connect to mongodb 
const connectToMongo =()=>{
       mongoose.connect(mongoURI,()=>{          // callback function
        console.log("Connected to mongo successfully...")
       })
    }

module.exports = connectToMongo;    
mongoose.set('strictQuery', true);