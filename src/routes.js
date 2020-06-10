require('dotenv').config('../.env')

const express = require('express')
const cloudinary = require('cloudinary')
const multer = require('multer')

const user_controller = require('./controllers/user')
const post_controller = require('./controllers/post')
const auth_middleware = require('./middleware/auth')

const route = express.Router()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

route.post('/sign_up', user_controller.sign_up)
route.post('/sign_in', user_controller.sign_in)

route.use(auth_middleware)

route.get('/posts', post_controller.show_posts)
route.get('/profile/:username', user_controller.show_profile)
route.get('/user', user_controller.get_user)

route.post('/post/create', upload.single('file'), post_controller.create_post)
route.post('/post/like', post_controller.like_post)
route.post('/user/add/picture', upload.single('file'), user_controller.user_picture)
route.post('/user/delete/picture', upload.single('file'), user_controller.user_picture_delete)

module.exports = route

