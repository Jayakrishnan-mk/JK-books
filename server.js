const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const session = require('express-session');
const { v4 : uuidv4} = require('uuid');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');


const connectDB = require('./server/database/connection');

const app = express(); 

dotenv.config({ path: '/config.env'});

const PORT = process.env.PORT || 3005;

//override the method in form......
app.use(methodOverride('_method'));

//log requests....................
app.use(morgan('tiny'));

//mongodb connection...............
connectDB();

//parse json bodies...............
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.set ('view engine', 'ejs');

app.use('/css', express.static(path.join(__dirname, "assets/css")));
app.use('/bootstrap', express.static(path.join(__dirname, "assets/css/bootstrap")));
app.use('/theme', express.static(path.join(__dirname, "assets/css/theme")));
app.use('/img', express.static(path.join(__dirname, "assets/img")));
app.use('/fonts', express.static(path.join(__dirname, "assets/fonts")));
app.use('/js', express.static(path.join(__dirname, "assets/js")));

//...cache clearing...............
app.use((req, res, next) => {
    if(!req.user){
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
    }
    next();
})

//..session handling.............
app.use(session({
    secret: uuidv4(),
    resave: false, 
    saveUninitialized: true
}))

//....Home route......................
// app.get('/', async(req, res) =>{
//     if(req.session.userLogin){
//         const user = await userdb.findOne({
//             email: req.body.email,
//             password: req.body.password
//         })
//         res.render('user_home', {user: user});
//     }
//     else{
//         res.render('user_login');
//     }
// })

app.get('/', async(req, res) =>{
   
        res.render('index');
    
})


// load routers...................
// app.use('/', require('./server/routes/router'));
// app.use('/', require('./server/routes/adminRouter'));

app.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`);});

