var GoogleSheetService = require('../services/google_sheet_service'),
    _ = require('underscore');

exports.index = function (req, res) {
  data = new GoogleSheetService(process.env.GOOGLE_DOC_RACING);
  data.getData(function (results) {

    if (req.query.group_by) {
      results = _.groupBy(results, function(i) {
        return i[req.query.group_by];
      });
    }

    if (req.query.sort_by) {
      results = _.sortBy(results, function(i) {
        return i[req.query.sort_by];
      });
    }

    res.json(results);
  });
};
