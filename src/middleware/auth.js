const jwt = require('jsonwebtoken')

const auth_config = require('../config/auth')

module.exports = (req, res, next) => {
    const auth_header = req.headers.authorization

    if (!auth_header) {
        res.json({ message: 'No token provider' })
        return
    }

    const parts = auth_header.split(' ')

    if (!parts.lenght === 2) {
        res.json({ message: 'Token error' })
        return
    }

    const [scheme, token] = parts

    if (!/^Bearer$/i.test(scheme)) {
        res.json({ message: 'Badly formatted token' })
    }

    jwt.verify(token, auth_config.secret, (err, decoded) => {
        if (err) {
            res.json({ message: 'Token invalid' })
            return
        }

        req.user_id = decoded.id
        return next()
    })

}