const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const InvoiceSchema = new mongoose.Schema({
  
  invoiceNumber: { type: String, required: true, unique: true },
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  partyName: { type: String, required: true },
  partyPhone: { type: String, required: true },
  items: [ItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['paid', 'unpaid', 'partial'], default: 'unpaid' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);