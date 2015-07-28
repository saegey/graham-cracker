var mongoose = require('mongoose');
var _ = require('underscore');

mongoose.connect(process.env.MONGOLAB_URI);
var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("Connected to DB");
});

var sleep = require('sleep');

var InstagramDataStorageService = require('./services/instagram_data_storage_service');

var InstagramTopic = require('./models/instagram_topic');
var InstagramPhoto = require('./models/instagram_photo');
var InstagramUser = require('./models/instagram_user');

InstagramTopic.find({}, function (err, topics) {
  // console.log(topics);
  var users = [];
  topics.forEach(function (topic) {
    // if (topic.users) { console.log(topic.users); }
    // console.log(topic.name);
    topic.users.forEach(function (u) {
      users.push(u.id);
    });
    var index = 0;
    var usersToSync = _.uniq(users);
    // setInterval(function() {
    //   igSvc.syncUser(usersToSync[index]);
    //   console.log(usersToSync[index]);
    //   index = index + 1;
    // }, 10000);
    //   console.log('sync user:' + u.id);
    //   var igSvc = new InstagramDataStorageService();
    //   sleep.sleep(20);
    //   igSvc.syncUser(u.id);
    // });
  });
});

var igSvc = new InstagramDataStorageService();
// igSvc.syncUser("41940133");
// igSvc.syncFollowedUsers()
igSvc.syncUserFeed();
