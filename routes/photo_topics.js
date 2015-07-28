var InstagramTopic = require('../models/instagram_topic');
var InstagramPhoto = require('../models/instagram_photo');
var InstagramUser = require('../models/instagram_user');
var ModelHelper = require('../lib/model_helper');
var _ = require('underscore');

exports.create = function (req, res) {
  console.log(req.body);
  var instagramTopic = new InstagramTopic(req.body);
  instagramTopic.created_time = new Date();
  instagramTopic.save(function(err) {
    if(err) {
      res.send(err.errors);
    } else {
      console.log('Created: [InstagramTopic]: ' + instagramTopic.created_time);
      res.send(instagramTopic);    // echo the result back
    }
  });
};

exports.delete = function (req, res) {
  console.log(req.params)
  InstagramTopic.find({"name": req.params.name}).remove().exec();
  // InstagramTopic.find({"name": req.params.name}, function (err, result) {
  //   res.send(result[0])
  // });
  res.send({});
}

exports.list = function (req, res) {
  console.log(req.query);
  if (req.query.q && req.query.q.length) {
    var query = {"name": new RegExp('(' + req.query.q + ')', 'gi') };
  } else {
    var query = {};
  }
  console.log(query);
  InstagramTopic.find(query, function (err, results) {
    res.send(results);
  });
}

exports.view_list = function (req, res) {
  InstagramTopic.find({}).sort({name: 1}).exec(function(err, results ){
    res.render('topics', {results: results});
  });
}

exports.show = function (req, res) {
  InstagramTopic.find({"name": req.params.name}, function (err, results) {
    res.send(results);
  });
}

exports.feed = function (req, res) {
  InstagramTopic.findOne({"name": req.params.name}, function (err, topic) {
    var usernames = topic.users.map(function (u) {
      return u.username;
    })
    var filter = {
      "user.username": {
        $in: usernames
      }
    };
    ModelHelper.paginate(InstagramPhoto, filter, req, function (formattedResult) {
      res.json(formattedResult);
    }, 'created_time');
  });
}

exports.view_topic = function (req, res) {
  InstagramTopic.findOne({"name": req.params.name}, function (err, topic) {
    console.log(topic);
    res.render('view_topics', {
      results: topic,
      name: req.params.name
    });
  });
}

exports.view_feed = function (req, res) {
  InstagramTopic.findOne({"name": req.params.name}, function (err, topic) {
    var usernames = topic.users.map(function (u) {
      return u.username;
    })
    var filter = {
      "user.username": {
        $in: usernames
      }
    };
    // console.log(filter, topic.users);
    // res.json(filter);
    ModelHelper.paginate(InstagramPhoto, filter, req, function (formattedResult) {
      // console.log(formattedResult);
      res.render('feed', {
        results: formattedResult,
        page: parseInt(req.query.page),
        name: req.params.name,
        item_count: formattedResult.item_count,
      });
    }, 'created_time');
  });
}

exports.addUser = function (req, res) {
  console.log(req.body);
  var filter = {name: req.params.name};
  InstagramTopic.findOne(filter, function(err, result) {
    if (result) {
      result.user_ids.push(req.body.user_id);
      result.save();
      InstagramUser.findOne({"id": req.body.user_id}, function(err, user) {
        user.topics.push(result.name);
        user.save();
        res.json(result);
      });
    } else {
      res.json(err);
    }
  });
}

exports.removeUser = function (req, res) {
  InstagramTopic.findOne({"name": req.params.name}, function(err, topic) {

    var remainingUsers = _.reject(topic.users, function (user) {
      console.log(user.id === parseInt(req.body.user_id))
      var user_id = parseInt(req.body.user_id);
      return user.id == user_id; }
    );

    topic.users = remainingUsers;
    topic.save();
    // res.json(topic);

    InstagramUser.findOne({"id": req.body.user_id}, function (err, user) {
      user.topics = _.reject(user.topics, function (topic) {
        return topic === req.params.name;
      });
      user.save();
      res.json(topic);
    });
  });
}
