require('dotenv').config();
const mongoose=require('mongoose');

// Use environment variable for database connection
const dbConnectionString = process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/omm_server';

const db=mongoose.createConnection(dbConnectionString)
.on('open',()=>{
    console.log('🔗 MongoDB connected successfully');
    console.log('📍 Database:', dbConnectionString);
}).on('error',(err)=>{
    console.log('❌ MongoDB connection error:',err);
});

module.exports=db;