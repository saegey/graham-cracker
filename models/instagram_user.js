var mongoose = require('mongoose');

var instagramUserSchema = mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true },
  profile_picture: { type: String, required: true },
  full_name: { type: String, required: false },
  created_at: { type: Date, required: true },
  topics: [String]
});

instagramUserSchema.plugin(require('mongoose-paginate'));
var instagramUser = mongoose.model('instagramUser', instagramUserSchema);

module.exports = instagramUser;
