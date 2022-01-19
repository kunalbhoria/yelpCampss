const{campgroundSchema,reviewSchema}= require('./schema');
const ExpressError = require('./utils/expressError')

module.exports.validateCampground = (req,res,next)=>{

const{error}=campgroundSchema.validate(req.body);
if (error) {
    const msg = error.details.map(el => el.message).join(',')
    req.flash("error",msg);
    // throw new ExpressError(msg, 400)
    res.redirect('/campground/add');
} else {
    next();
}
};


module.exports.validateReview = (req,res,next)=>{

const{error}=reviewSchema.validate(req.body);
if (error) {
    const {id}= req.params;
    const msg = error.details.map(el => el.message).join(',')
    req.flash("error",msg);
    console.log(error)
   // throw new ExpressError(msg, 400)
    res.redirect(`/campground/${id}`);
} else {
    next();
}
};


module.exports.isLoggedIn = (req,res,next)=>{
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}