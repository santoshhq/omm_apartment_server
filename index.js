require('dotenv').config();
const app=require('./app');
const PORT = process.env.PORT || 8080;
const db=require('./config/db');
const Signup=require('./models/auth.models/signup');

// Middleware



app.get('/',(req,res)=>{
    res.send('Hello World!');
});
app.listen(PORT,()=>{
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Server URL: http://localhost:${PORT}`);
});