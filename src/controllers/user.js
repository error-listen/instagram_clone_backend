const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')
const fs = require('fs')

const user_model = require('../models/user')
const post_model = require('../models/post')
const auth_config = require('../config/auth')

function generate_token(params = {}) {
    return jwt.sign(params, auth_config.secret)
}

module.exports = {

    async sign_up(req, res) {
        const hashed_password = await bcrypt.hash(req.body.password, 10)
        const user = { username: req.body.username, full_name: req.body.full_name, password: hashed_password }
        const user_exist = await user_model.findOne({ username: req.body.username })

        if (user_exist) {
            res.json({ message: 'User already exists' })
            return
        }

        const create_user = await user_model.create(user)
        res.json({ message: 'Created user', create_user, token: generate_token({ id: create_user._id }) })

    },

    async sign_in(req, res) {
        const user = await user_model.findOne({ username: req.body.username })

        if (user == null) {
            res.json({ message: 'The user name entered does not belong to an account. Check your username and try again.' })
            return
        }

        if (await bcrypt.compare(req.body.password, user.password)) {
            res.json({ message: 'Valid log in', user, token: generate_token({ id: user._id }) })
        } else {
            res.json({ message: 'Invalid credentials' })
        }
    },

    async get_user(req, res) {
        const user = await user_model.findById(req.user_id)

        res.status(200).send({ message: 'User', user })
    },

    async show_profile(req, res) {
        const user = await user_model.findOne({ username: req.params.username })

        res.json({ message: 'User', user })
    },

    async user_picture(req, res) {
        const { user_id } = req.body

        const user = await user_model.findById(user_id)

        if (user.picture_url) {
            cloudinary.v2.api.delete_resources(user.picture_id)
        }

        cloudinary.v2.uploader.upload(`uploads/${req.file.filename}`, { folder: 'instagram_clone' },
            async function (error, result) {

                const file_url = result.secure_url

                user.picture_url = file_url
                user.picture_id = result.public_id

                const post_user_liked = await post_model.find({ likes: { $elemMatch: { username: user.username } } })

                post_user_liked.forEach(async (post) => {
                    await post_model.updateOne({ _id: post.id, 'likes.username': user.username },
                        { $set: { 'likes.$.picture_url': file_url } })
                })

                await post_model.updateMany({ author: { $eq: user.username } }, { $set: { picture_url: file_url } })

                await user.save()

                fs.unlinkSync(`uploads/${req.file.filename}`)

                res.json({ message: 'Picture added', user })
            })
    },

    async user_picture_delete(req, res) {
        const { user_id } = req.body

        const user = await user_model.findById(user_id)

        cloudinary.v2.api.delete_resources(user.picture_id)

        user.picture_url = ''
        user.picture_id = ''

        const post_user_liked = await post_model.find({ likes: { $elemMatch: { username: user.username } } })

        post_user_liked.forEach(async (post) => {
            await post_model.updateOne({ _id: post.id, 'likes.username': user.username },
                { $set: { 'likes.$.picture_url': '' } })
        })

        await post_model.updateMany({ author: { $eq: user.username } }, { $set: { picture_url: user.picture_url } })

        await user.save()

        res.json({ message: 'Picture deleted', user })
    }

}