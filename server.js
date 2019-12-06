const app = require('./app');
const db = require('./db');
const apiPort = 6201;

db.on('error', console.error.bind(console, 'MongoDB connection error:'))
app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));