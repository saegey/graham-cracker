var InstagramPhoto = require('../models/instagram_photo');
var InstagramUser = require('../models/instagram_user');
var InstagramTopic = require('../models/instagram_topic');

var ModelHelper = require('../lib/model_helper');
var InstagramDataStorageService = require('../services/instagram_data_storage_service');

var ig = require('instagram-node').instagram();

exports.followers = function (req, res) {
  var igSvc = new InstagramDataStorageService();
  igSvc.syncFollowedUsers();
  res.json({"status": "okay"})
}

exports.user = function (req, res) {
  var filter = { 'user.username': process.env.INSTAGRAM_USERNAME };
  ModelHelper.paginate(InstagramPhoto, filter, req, function (formattedResult) {
    res.json(formattedResult);
  }, 'created_time');
};

exports.user_view = function (req, res) {
  var filter = { 'user.username': req.params.username };
  ModelHelper.paginate(InstagramPhoto, filter, req, function (formattedResult) {
    res.render('user_photos', {
      results: formattedResult,
      page: parseInt(req.query.page)
    });
  }, 'created_time');
};

exports.liked = function (req, res) {
  var filter = { 'user.username': { $ne: process.env.INSTAGRAM_USERNAME } };
  ModelHelper.paginate(InstagramPhoto, filter, req, function (formattedResult) {
    res.json(formattedResult);
  }, 'created_time');
};

exports.tagged = function (req, res) {
  var filter = {
    "tags": {
      '$regex' : '.*' + req.params.tag + '.*'
    },
    "user.username": process.env.INSTAGRAM_USERNAME
  };
  ModelHelper.paginate(InstagramPhoto, filter, req, function (formattedResult) {
    res.json(formattedResult);
  });
};

exports.following = function (req, res) {
  ModelHelper.paginate(InstagramUser, {}, req, function (r) {
    res.json(r);
  }, 'created_at');
};

exports.list = function (req, res) {
  ModelHelper.paginate(InstagramPhoto, {}, req, function (r) {
    res.render('photos', {
      results: r,
      page: parseInt(req.query.page)
    });
    // res.json(r);
  });
}

exports.like = function (req, res) {
  var ig = require('instagram-node').instagram();
  ig.use({
    access_token: process.env.INSTAGRAM_ACCESS_TOKEN
  });
  console.log(req.params.id);
  ig.add_like(req.params.id, function (err) {
    console.log(err);
    res.json('OK');
  });
}

exports.view_following = function (req, res) {
  ModelHelper.paginate(InstagramUser, {}, req, function (r) {
    res.render('following', {
      results: r,
      page: parseInt(req.query.page)
    });
  }, 'id');
};

exports.view_following_partial = function (req, res) {
  if (req.query.q && req.query.q.length) {
    var query = {"username": new RegExp('(' + req.query.q + ')', 'gi') };
  } else {
    var query = {};
  }
  console.log(query);
  ModelHelper.paginate(InstagramUser, query, req, function (r) {
    res.render('following_partial', {
      results: r,
      page: parseInt(req.query.page)
    });
  }, 'id');
};

exports.user_topics = function (req, res) {
  InstagramUser.findOne({"id": req.params.id}, function (err, user) {
    if (user) {
      user.topics = req.body.topics;
      user.save(function (err) {
        user.topics.forEach(function (t) {
          // console.log(t);
          InstagramTopic.findOne({"name": t}, function (err, topic) {
            console.log(err);
            if (!topic) {
              topic = new InstagramTopic({"name": t});
            }
            topic.users.push(user);
            topic.save();
          });
        });
        if (err) { throw err; }
      });
      res.json('saved');
    } else {
      res.json('failed');
    }
  });
  // console.log(req.params, req.body);

};
