const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const blogPostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
    averageRating: { type: Number, default: 0 },
    ratings: [
        {
            user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
            value: {type: Number, default: 0}
        }
    ],
    comments: [
        { 
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            text: { type: String, required: true },
            date: { type: Date, default: Date.now },
        }
    ],
    disabled: { type: Boolean, default: false },
});

blogPostSchema.plugin(mongoosePaginate);

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;