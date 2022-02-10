const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const campSchema = new Schema({
    title:{
        type : String,
        required:true,
    },
    location:{
        type : String,
        required:true,
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price:{
        type : Number,
        required:true,
    },
    image: [ImageSchema],
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
