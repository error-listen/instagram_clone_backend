const { model } = require('mongoose')
const { Schema } = require('mongoose')

const users_schema = new Schema({
    username: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    picture_url: {
        type: String,
        required: false,
        default: ''
    },
    picture_id: {
        type: String,
        required: false
    }
})

module.exports = model('users', users_schema)