const express = require('express');
const { session } = require('passport');
const passport = require('passport');
const router = express.Router();
const User = require('../modules/user')

router.route('/register')
.get((req,res)=>{
    res.render('user/register');
})
.post(async(req,res,next)=>{
    try{
    const {email,username,password} = req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser, err => {
        if (err) return next(err);
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
    })
    }
    catch(err){req.flash('error', err.message);
    res.redirect('/register');
};
})

router.route('/login')
.get((req,res)=>{
    res.render('user/login')
})
.post( passport.authenticate('local',{ failureFlash: true, failureRedirect: '/login' }),async(req,res,next)=>{
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo; 
    req.flash("success","welcome, you login Successfully")
    res.redirect(`${redirectUrl}`)
})


router.get('/logout',(req,res)=>{
    req.logOut();
    req.flash("success","You logout Successfully")
    res.redirect('/campgrounds')
})

module.exports =router;
