/*jslint node: true */
/*jslint nomen: true */
'use strict';

// var ig = require('instagram-node').instagram();
var InstagramTopicList = require('../models/instagram_topic_list');
var InstagramPhoto = require('../models/instagram_photo');
// ig.use({ access_token: process.env.INSTAGRAM_ACCESS_TOKEN });

function InstagramFeedService() {}

InstagramFeedService.feed = function (topicName, callback) {
  InstagramTopicList.find({"name": topicName}, function (err, result) {
    if (result) {
      var filter = {
        "user.id": {
          $in: result.userIds
        }
      };
      InstagramPhoto.find(filter, callback);
    }
  })
}
