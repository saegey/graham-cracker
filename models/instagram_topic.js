var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true },
  profile_picture: { type: String, required: true },
  full_name: { type: String, required: false }
});

var instagramTopicSchema = mongoose.Schema({
  name: { type: String, required: true },
  users: [userSchema]
});

instagramTopicSchema.plugin(require('mongoose-paginate'));
var instagramTopic = mongoose.model('InstagramTopicList', instagramTopicSchema);

module.exports = instagramTopic;
