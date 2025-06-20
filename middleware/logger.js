const express = require('express');
const app = express();
function logger(req, res, next){
   console.log(`${req.method} ${req.url}`);
}

app.use(logger);