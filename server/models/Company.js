const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  fssaiNumber: { type: String, required: true, unique: true },
  gstNumber: { type: String, unique: true },
  phoneNumber: { type: String, required: true },
  alternateNumber: { type: String },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  logo: { type: String },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', CompanySchema);