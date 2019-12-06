const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRouter = require('./routes/user-router');

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/api/v1', userRouter)

module.exports = app;