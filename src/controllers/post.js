const cloudinary = require('cloudinary')
const fs = require('fs')

const post_model = require('../models/post')
const user_model = require('../models/user')

module.exports = {

    async show_posts(req, res) {
        const posts = await post_model.find().sort('-createdAt')

        res.json({ message: 'Posts', posts })
    },

    async create_post(req, res) {
        const { description } = req.body
        const { type } = req.body
        const { user_id } = req.body

        const user = await user_model.findById(user_id)

        if (type === 'video') {
            cloudinary.v2.uploader.upload(`uploads/${req.file.filename}`, {
                resource_type: 'video',
                public_id: `${req.file.filename}`,
                folder: 'instagram_clone'
            },
                async function (error, result) {

                    if (error) {
                        return
                    }

                    const file_url = result.secure_url

                    const author = user.username
                    const picture_url = user.picture_url

                    await user.save()

                    const post = await post_model.create({
                        author,
                        description,
                        picture_url,
                        file_url,
                        type
                    })

                    res.send

                    fs.unlinkSync(`uploads/${req.file.filename}`)
                    res.json({ message: 'Created post', post })
                })
        } else if (type === 'image') {
            cloudinary.v2.uploader.upload(`uploads/${req.file.filename}`, { folder: 'instagram_clone' },
                async function (error, result) {

                    if (error) {
                        return
                    }

                    const file_url = result.secure_url

                    const author = user.username
                    const picture_url = user.picture_url

                    await user.save()

                    const post = await post_model.create({
                        author,
                        description,
                        picture_url,
                        file_url,
                        type
                    })

                    fs.unlinkSync(`uploads/${req.file.filename}`)
                    res.json({ message: 'Created post', post })
                })
        }
    },

    async like_post(req, res) {
        const { post_id } = req.body
        const { user_id } = req.body

        const user_logged = await user_model.findById(user_id)
        const post = await post_model.findById(post_id)

        const logged_socket = req.connected_users[user_id]

        for (var i = 0; i < post.likes.length; i++) {
            var like = post.likes[i];


            if (user_logged.username.indexOf(like.username) !== -1) {
                post.likes.splice(i, 1);
                await post.save()
                req.io.to(logged_socket).emit('post', post)
                res.send(post)
                return
            }
        }

        post.likes.push({ username: user_logged.username, picture_url: user_logged.picture_url })
        await post.save()
        req.io.to(logged_socket).emit('post', post)
        res.json({ message: 'Liked post', post })
    },
}