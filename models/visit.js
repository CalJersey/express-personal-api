 var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var Vacation = new Schema({
  vacationerName: String,
  country: String,
  year: Number,
  daysStayed: Number,
  review: String,
 });

var Vacation = mongoose.model('Vacation', VacationSchema);

module.exports = Vacation;
