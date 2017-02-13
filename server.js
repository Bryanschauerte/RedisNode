import express from 'express';
import browserify from 'browserify-middleware';
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 8080;
const bodyParser =require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const expressJWT = require('express-jwt');
const compression = require('compression');
const helmet = require('helmet');
const app = express();
const redis = require('redis')
let client = redis.createClient();
browserify.settings.mode = 'production';
browserify.settings({transform: ['babelify']});
app.use(compression({filter: shouldCompress}))
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard('deny'));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json' }))
app.use('/assets', express.static('assets'));
app.get('/cacheToy', cache, getNumber);

client.on('connect', function() {
    console.log('connected');
});

function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    return false
  }
  return compression.filter(req, res)
}



function cache(req, res, next) {
    const someKey = req.query.someKey;
    client.get(someKey, function (err, data) {
        if (err) throw err;

        if (data != null) {
            res.send(respond(someKey, data));
        } else {
            next();
        }
    });
}
function getNumber(req, res, next) {
    return res.send('i was not cached')
};

//
///error handling///
//

client.on('error', function (er) {
  console.trace('Module A') // [1]
  console.error(er.stack) // [2]
})

process.on('uncaughtException', function (er) {
  console.error(er.stack)
  process.exit(1)
})
//End Error handling


app.listen(3000, function () {
  console.log('Monkey juggling on port 3000!')
})
