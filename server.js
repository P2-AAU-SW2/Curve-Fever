const express = require('express');
const app = express();
const logger = require('morgan');
const path = require('path');
require('dotenv').config();

//const PORT = process.env.PORT;
const PORT = 3000;
const HOST = process.env.HOST;

// Setup
app.use(logger('dev'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const homeRouter = require('./routes/home');

// Router setup
app.use('/', indexRouter)
app.use('/login', loginRouter);
app.use('/home', homeRouter);

app.get('/version', function(req, res) {
  res.json({version: process.env.npm_package_version})
})

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`)
})
