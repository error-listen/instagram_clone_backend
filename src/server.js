require('dotenv').config('../.env')

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const routes = require('./routes')

const app = express()

const server = require('http').Server(app, { origins: '*:*'})
const io = require('socket.io')(server)

mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

const connected_users = {}

io.on('connection', socket => {
    const { user } = socket.handshake.query

    connected_users[user] = socket.id
})

app.use((req, res, next) => {
    req.io = io
    req.connected_users = connected_users

    next()
})

app.use(cors())
app.use(express.json())
app.use(routes)

server.listen(process.env.PORT || 5000, () => {
    console.log('Running server on port 4000')
})