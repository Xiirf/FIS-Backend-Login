const mongoose = require('mongoose')

mongoose
    .connect(process.env.uriDataBase, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

module.exports = db