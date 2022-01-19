const express = require('express');
const router = express.Router({ mergeParams: true });

const Campground = require('../modules/campground');
const Review = require('../modules/review');
const User = require('../modules/user');
const catchAsync = require('../utils/catchAsync');

const {validateReview,isLoggedIn}=require('../middleware');

// for add review
router.post('/' ,isLoggedIn, validateReview, catchAsync(async(req,res)=>{
    const {id}= req.params;
    const campground = await Campground.findById(id);
    const {_id,username} = req.user;
    const review = await new Review(req.body.review);
    review.author = _id;
    review.save();
    campground.reviews.push(review);
    campground.save();
    req.flash('success', 'Review added successfully');
    res.redirect(`/campground/${id}`)
}));

//for review delete
router.delete('/:reviewid',isLoggedIn, catchAsync( async(req,res)=>{
    const{id,reviewid} = req.params;
    const campground = await Campground.findByIdAndUpdate({_id:id},{$pull:{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
    req.flash('success', 'Review deleted successfully');
    res.redirect(`/campground/${id}`)

}));

module.exports = router;