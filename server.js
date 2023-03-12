const express = require('express');
require('dotenv').config();
const app = express();
const logger = require('morgan');
const path = require('path');

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


app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`)
})
