if(process.env.NODE_ENV !=="production"){
    require("dotenv").config()
}

// importing lib 
const express = require("express")
const app = express()
const path = require('path');
const bcrypt = require("bcrypt")// bcrypt
const passport = require("passport")
const initializePassport = require("./passport-conf")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")



initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)





// to get img files in ejs
app.use(express.static(path.join(__dirname, 'public')));



const users =[]
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,//wont resave session var if nothin changed
    saveUninitialized:false
}))



app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false
}));





//config login
app.post("/login",checkNotAuthenticated, passport.authenticate("local", {
    successRedirect:"/",
    failureRedirect:"/login",
    failureFlash: true
}))



//config register
app.post("/register",checkNotAuthenticated, async (req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name:req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        console.log(users);
        res.redirect("/login")
    }catch(err){
        console.log(err);
        res.redirect("/register")
    }
})





//routes
app.get('/',(req,res)=>{
    res.render("index.ejs", {name: req.user.name})
})

app.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render("login.ejs")
})

app.get('/register',checkNotAuthenticated,(req,res)=>{
    res.render("register.ejs")
})
//end routes




//logout
app.delete('/logout', (req, res) => {
    // Perform logout actions, e.g., destroying session
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/login');
    });
});









//homepage doesn't redirect to login untill logout btn
function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}






//server running
app.listen(3000)