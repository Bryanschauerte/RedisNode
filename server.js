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

// loredis to have easier access to expiration, just for cacheParamToy route
var Redis = require('ioredis');
var redis = new Redis();

// caching routes -> anything complied on the server (*cough *cought react)
var cache = require('express-redis-cache')({ expire: 60 });

// Jade for templeting but would be amazing for iso react

var jade = require('jade');

// to allow es6 and modules
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


//jade view engine
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')


app.use('/assets', express.static('assets'));

//testing speed of param requests
// Also how one would do an api call that may need to be chached
//ex. postman get request http://localhost:3000/cacheParamToy?someKey=22
app.get('/cacheParamToy', cacheIt, nexTick);

// Whole route is cache, condition can be swapped with a cookie or session ect.
app.get('/jadeRoute', useCache, renderJade)


// route handlers
function useCache(req, res,next){
  !req.query.ignoreCache? cache.route({name:'jadeRoute'}): next();
}

function renderJade(req, res){
  res.render('viewTemp', { title: 'Hey', message: 'Hello there!' })
}

function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    return false
  }
  return compression.filter(req, res)
}

function cacheIt(req, res, next) {
    const someKey = req.query.someKey;
    redis.get('someKey', function (err, data) {
        if (err) throw err;
        if(data == null){
          redis.set('someKey', req.query.someKey);
          return res.send('i was not cached')
        }
        if (data != null) {
            res.send(`someKey cached value, ${data}`);
        } else {
            next();
        }
    });
}

function nexTick(req, res, next) {
    return res.send('Im the next tick')
};

//
///  [error handling]  ///
//


process.on('uncaughtException', function (er) {
  console.error(er.stack)
  process.exit(1)
})
//End Error handling


app.listen(3000, function () {
  console.log('Monkey juggling on port 3000!')

})
