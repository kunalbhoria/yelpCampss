const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user')

const reviewSchema = new Schema({
    rating:{
        type:Number,
        required:true
    },
    comment:{
        type:String,
        required:true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Review', reviewSchema);