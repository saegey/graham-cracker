if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}
var mongoose = require('mongoose');
var http = require('http');
var express = require('express');
var routes = require("./routes");
var bikes = require('./routes/bikes');
var photos = require('./routes/photos');
var photo_topics = require('./routes/photo_topics');
var bike_racing = require('./routes/bike_racing');
var path = require('path');

var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');

mongoose.connect(process.env.MONGOLAB_URI);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("Connected to DB");
});

var app = express();

var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

var app = express();

app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(allowCrossDomain);
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());

if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.get('/', routes.index);

app.get('/v1/photos/user', photos.user);
app.get('/v1/photos/liked', photos.liked);
app.get('/v1/photos/following', photos.following);
app.get('/v1/photos/tag/:tag', photos.user);
app.get('/v1/photos', photos.list);
app.get('/v1/photos/:id/like', photos.like)

app.post('/v1/photos/topic', photo_topics.create);
app.put('/v1/photos/topic/:name/add', photo_topics.addUser);
app.put('/v1/photos/topic/:name/remove', photo_topics.removeUser);
app.get('/v1/photos/topic', photo_topics.list);
app.get('/v1/photos/topic/:name', photo_topics.show);

app.delete('/v1/photos/topic/:name', photo_topics.delete);
app.get('/v1/photos/topic/:name/feed', photo_topics.feed);
app.post('/v1/photos/users/:id', photos.user_topics);
app.get('/v1/followers', photos.followers);

app.get('/following', photos.view_following);
app.get('/following/partial', photos.view_following_partial);
app.get('/topics/:name/feed', photo_topics.view_feed);
app.get('/topics/:name', photo_topics.view_topic);
app.get('/topics', photo_topics.view_list);
app.get('/photos', photos.list);
app.get('/users/:username', photos.user_view)

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
