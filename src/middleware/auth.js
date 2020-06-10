const jwt = require('jsonwebtoken')

const auth_config = require('../config/auth')

module.exports = (req, res, next) => {
    const auth_header = req.headers.authorization

    try {
        if (!auth_header) {
            throw res.status(401).json({ message: 'No token provider' })
        }

        const parts = auth_header.split(' ')

        if (!parts.lenght === 2) {
            throw res.status(401).json({ message: 'Token error' })
        }

        const [scheme, token] = parts

        if (!/^Bearer$/i.test(scheme)) {
            throw res.status(401).json({ message: 'Badly formatted token' })
        }

        jwt.verify(token, auth_config.secret, (err, decoded) => {
            try {
                if (err) {
                    throw res.status(401).json({ message: 'Token invalid' })
                }

                req.user_id = decoded.id
                return next()
            } catch (err) {
                res.json({ message: err })
            }
        })
    } catch (err) {
        res.json({ message: err })
    }

}