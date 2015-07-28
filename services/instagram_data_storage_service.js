/*jslint node: true */
/*jslint nomen: true */
'use strict';

var ig = require('instagram-node').instagram();
var InstagramPhoto = require('../models/instagram_photo');
var InstagramUser = require('../models/instagram_user');
ig.use({ access_token: process.env.INSTAGRAM_ACCESS_TOKEN });
var sleep = require('sleep');

function InstagramDataStorageService() {}

InstagramDataStorageService.prototype.syncLikedPhotos = function () {
  ig.user_self_liked([], InstagramDataStorageService.savePhotos);
};

InstagramDataStorageService.prototype.syncUserFeed = function () {
  InstagramPhoto.findOne({}).sort('-id').exec( function(err, doc) {
    ig.user_self_feed({count: 1000}, InstagramDataStorageService.savePhotos);
  });
  // ig.user_self_feed({count: 1000, max_id: max_id}, InstagramDataStorageService.savePhotos);
};

InstagramDataStorageService.prototype.syncFollowedUsers = function () {
  ig.user_follows('1173417', InstagramDataStorageService.saveUsers);
};

InstagramDataStorageService.prototype.syncUser = function(userId) {
  ig.user_media_recent(userId, {count: 1000}, InstagramDataStorageService.savePhotos);
};

InstagramDataStorageService.prototype.syncUserPhotos = function () {
  ig.user_self_media_recent([], InstagramDataStorageService.savePhotos);
};

InstagramDataStorageService.savePhotos = function (err, medias, pagination, limit) {
  if (err) { throw err; }
  medias.forEach(function (m) {
    InstagramPhoto.findOneAndUpdate({id: m.id}, m, ['upsert'], function(err, result) {
      if (err) { throw err; }

      if (!result) {
        var record = new InstagramPhoto(m);
        // var newTime = new Date(0);
        // newTime.setUTCSeconds(m.created_time);
        // record.created_time = newTime;

        record.save(function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log('Created: [InstagramPhoto]: (' + record.user.id + ') ' + record.created_time);
          }
        });
      } else {
        // result.created_time = new Date(result.created_time * 1000);
            console.log('Updated: [InstagramPhoto]: (' + result.user.id + ') ' + result.created_time);
        result.save(function(err) {
          if(err) { console.log(err); }
        });
      }
    });
  });
  if (pagination.next) {
    sleep.sleep(2);
    pagination.next(InstagramDataStorageService.savePhotos);
    // Will get second page results
  } else {
    console.log("no pages left")
  }
}

InstagramDataStorageService.saveUsers = function (err, medias, pagination, limit) {
  if (err) { throw err; }
  medias.forEach(function (m) {
    // console.log(m);
    InstagramUser.findOneAndUpdate({id: m.id}, m, ['upsert'], function(err, result) {
      if (err) { throw err; }

      if (!result) {
        var record = new InstagramUser(m);
        record.created_at = new Date();
        record.save(function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log('Created: [InstagramUser]: ' + record.created_at);
          }
        });
      } else {
        result.save(function(err) {
          if(err) { console.log(err); }
        });
      }
    });
  });
  if (pagination.next) {
    pagination.next(InstagramDataStorageService.saveUsers);
    // Will get second page results
  }
}

module.exports = InstagramDataStorageService;
