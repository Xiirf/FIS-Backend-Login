const mongoose = require('mongoose')
const uri = "mongodb://Xiirf:testmongo@cluster0-shard-00-00-ri07w.mongodb.net:27017,cluster0-shard-00-01-ri07w.mongodb.net:27017,cluster0-shard-00-02-ri07w.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

module.exports = db