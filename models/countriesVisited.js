 var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CountriesVisitedSchema = new Schema({
  name: String,
  yearVisited: Number,
  DaysStayed: Number,
  Impression: String,
 });

var CountriesVisited = mongoose.model('CountriesVisited', CountriesVisitedSchema);

module.exports = CountriesVisited;
