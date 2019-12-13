const mongoose = require('mongoose')
console.log('URI' + JSON.stringify(process.env))
mongoose
    .connect(process.env.uriDataBase, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

module.exports = db