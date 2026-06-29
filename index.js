require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path=require('path')
const connectDB =require("./app/config/db")
const Session=require('express-session')
const cookieParser=require('cookie-parser')
const profileRoutes = require('./app/routes/profile.routes')
const postRoutes = require('./app/routes/post.routes')

// DB Connect
connectDB()
const app=express();
// middleware 
app.use(express.json());
app.use(cors())
app.use(Session({
    secret:process.env.SESSION_SECRECT || "secrect",
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:1000*60*60*24 //1 day
    }
}))

app.use(cookieParser())
app.use(express.urlencoded({extended:false}))

//setup ejs
app.set('view engine','ejs');
app.set('views','views')

//static folder
app.use(express.static('public'))
app.use('uploads',express.static(path.join(__dirname,'/uploads')))
app.use('/uploads',express.static('uploads'))

app.get('/',(req,res) => {
    res.render("home")
})

app.use('/api/profile',profileRoutes)
app.use('/api/post',postRoutes)

const PORT = process.env.PORT

app.listen(PORT,(error)=>{
    if(error){
        console.log(`Error in PORT Listening : ${error.message}`);
    }else{
        console.log("server is running on port ",`http://localhost:${PORT}`);
    }
})