const express = require('express');
const router = express.Router();

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const Campground = require('../modules/campground');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expressError');
const Joi = require('joi');
const multer = require('multer');
const {cloudinary, storage } = require('../utils/cloudinary');
const upload = multer({ storage });

const {validateCampground , isLoggedIn}=require('../middleware');




//for new form
router.get('/add',isLoggedIn, (req, res) => {
    res.render('campground/newform')
});

//for edit form
router.get('/edit/:id',isLoggedIn, catchAsync(async(req, res) => {
    let camp = await Campground.findById(req.params.id);
  //  if(!camp) throw new ExpressError("Campground not found",404)
    if(!camp) {
        req.flash("error","Campground not found");
        res.redirect('/campgrounds');
    }
    console.log(camp)
    res.render('campground/edit',{camp})
}));

router.get('/search',catchAsync(async(req,res)=>{
    let {title}= req.query;
    console.log(title);
    let campgrounds = await Campground.find({title});
    console.log(campgrounds);
    res.render('campground/campgrounds', { campgrounds })
   
}));
//for save new 
router.post('/',isLoggedIn,upload.array('image'), validateCampground,catchAsync(async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    console.log(req.body)
    const{_id,username} = req.user;
    let newCamp = await new Campground({ ...req.body.campground })
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCamp.author = _id ;
    await newCamp.save();
    console.log(newCamp)
    req.flash("success","Successfully added new Campground")
    res.redirect(`/campground/${newCamp._id}`)
}));


router.route('/:id')
.get(catchAsync(async (req, res) => {
    const { id } = req.params;
    let camp = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    //if(!camp) throw new ExpressError("campground not found",404);
    if(!camp) {
        req.flash("error","Campground not found");
        res.redirect('/campgrounds');
    }
    res.render('campground/each', { camp })
}))
.put(isLoggedIn,upload.array('image'), validateCampground,catchAsync(async (req, res) => {
    const { id } = req.params;
    console.log(`hello${id}`);
    const camp = await Campground.findById(id);
  //  if(!camp) throw new ExpressError("campground not found",404);
    if(!camp) {
        req.flash("error","Campground not found");
        res.redirect('/campgrounds');
    }

    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.image.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash("success","Successfully updated .")
    res.redirect(`/campground/${id}`)
}))
.delete(isLoggedIn, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
  //  if(!camp) throw new ExpressError("campground not found",404);
    if(!camp) {
        req.flash("error","Campground not found");
        res.redirect('/campgrounds');
    }
   await camp.image.map(img=> cloudinary.uploader.destroy(img.filename))
    await Campground.findByIdAndDelete(req.params.id);
     req.flash("success","Successfully deleted your Campground")
    res.redirect('/campgrounds');
}))

module.exports=router;

