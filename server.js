const express = require('express')
require('dotenv').config()
const app = express()

//const PORT = process.env.PORT;
const PORT = 3000;
const HOST = process.env.HOST;

app.use(express.static('public'));

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`)
})