var request = require('request');

function BikeRaceService() {}

BikeRaceService.getIndividualResults = function (firstName, lastName, callback) {
  request(process.env.GOATRODEO_API_URL, function (err, data) {
    var individualResults = [];
    if (err) { throw (err); }
    var results = JSON.parse(data.body);
    results.forEach(function (race) {
      race.people.forEach(function (person) {
        if (person.first_name === firstName && person.last_name === lastName) {
          individualResults.push({
            "race_name": race.name,
            "race_date": race.date,
            "place": person.place,
            "field_size": person.field,
            "category": person.category
          });
        }
      });
    });
    callback(individualResults);
  });
}

module.exports = BikeRaceService;
