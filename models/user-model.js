const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema(
    {
        mail: { type: String, required: true },
        mdp: { type: String, required: true }
    },
    { timestamps: true },
)

module.exports = mongoose.model('users', User)