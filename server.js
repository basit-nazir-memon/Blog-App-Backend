const express = require('express')
const mongoose = require('mongoose')
const nodemon = require('nodemon')
const adminRoute = require('./routes/admin');
const authRoute = require('./routes/auth');
const blogPostRoute = require('./routes/blogPost');
const searchRoute = require('./routes/search');
const UserInteractionRoute = require('./routes/userInteraction');
require('dotenv').config()

const app = express()

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.t1ompdc.mongodb.net/WebProject`, { useNewUrlParser: true })

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', ()=>{console.log("DB Connection Successfull")});

app.use(express.json());

app.use('/', authRoute);
app.use('/', UserInteractionRoute);
app.use('/admin', adminRoute);
app.use('/posts', blogPostRoute);
app.use('/search', searchRoute);

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}!`))