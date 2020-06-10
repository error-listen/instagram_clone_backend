const { model } = require('mongoose')
const { Schema } = require('mongoose')

const posts_schema = new Schema({
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    picture_url: {
        type: String,
        required: false
    },
    file_url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    likes: [{
        type: Object,
        required: false,
    }]
}, {
    timestamps: true,
})

module.exports = model('posts', posts_schema)