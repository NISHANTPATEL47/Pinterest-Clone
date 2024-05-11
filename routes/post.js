const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    imageTitle: {
        type: String,
        required: true
    },
    imageText: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    likes: {
        type: Array,
        default: [],
    }
});

//create a post model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
