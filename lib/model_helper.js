var paginate = require('express-paginate');

function ModelHelper() {}

ModelHelper.paginate = function (model, filter, req, next, sortField) {
  var sortConfig = {};
  sortConfig[sortField || 'date'] = -1;
    console.log('sortConfig', sortConfig);
  model.paginate(filter, {"page": req.query.page, "limit": req.query.limit, "sortBy": sortConfig}, function(err, results, pageCount, itemCount) {
    if (err) { throw err; }
    next({
      object: 'list',
      has_more: paginate.hasNextPages(req)(pageCount),
      data: results,
      item_count: itemCount
    });
  });
};

module.exports = ModelHelper;
