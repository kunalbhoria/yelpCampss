const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user')
const Schema = mongoose.Schema;
const campSchema = new Schema({
    title:{
        type : String,
        required:true,
    },
    location:{
        type : String,
        required:true,
    },
    price:{
        type : Number,
        required:true,
    },
    image:{
        type : String,
        required:true,
    },
    description:{
        type : String,
        required:[true,"description is required"]
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:{
        type:[Schema.Types.ObjectId],
        ref:'Review'
    }
});

campSchema.post('findOneAndDelete', async function(obj){
    console.log(obj)
 await Review.deleteMany({_id:{$in:obj.reviews}});

})

module.exports = mongoose.model('Campground',campSchema);
