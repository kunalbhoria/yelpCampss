if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const methodOverride = require('method-override');
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const Joi = require('joi');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');
const MONGODB_URL = process.env.MONGODB_URL ||'mongodb://localhost:27017/camps'


const Campground = require('./modules/campground');
const Review = require('./modules/review');
const User = require('./modules/user');
const ExpressError = require('./utils/expressError')
const catchAsync = require('./utils/catchAsync');

mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('static'))

const secret = process.env.SECRET || "thisissessionsecretbutbadsecretsecret";

const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: MONGODB_URL,
      }),
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(methodOverride('_method'));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');
const loginRoutes = require('./routes/login')

app.use((req, res, next) => {
   // console.log(req.session)
    console.log(`current user ${req.user}`)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.redirect('/campgrounds');
})

app.get('/campgrounds',catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    campgrounds.reverse();
    res.render('campground/campgrounds', { campgrounds })
}));
app.use('/campground',campgroundRoutes)
app.use('/campground/:id/review',reviewRoutes)
app.use('/',loginRoutes);


app.all('*',(req,res,next)=>{
    throw new ExpressError("page not found",404);
})

app.use((err,req,res,next)=>{
    const{statusCode = 400} = err;
    if(!err.message) err.message = "error something went wrong";
    res.status(statusCode).render('error',{err});
})

const port = process.env.PORT || 3030;
app.listen(port, () => {
    console.log(`connected to port ${port}`)
})

