const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
 
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  place: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Party', PartySchema);