const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Party = require('../models/Party');

exports.createInvoice = async (req, res) => {
  try {
    const { partyId, paymentStatus, items, ...invoiceData } = req.body;
    
    const party = await Party.findOne({ _id: partyId });
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }

    let subtotal = 0;
    const invoiceItems = [];
    
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId});
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      
      const itemTotal = item.quantity * product.price;
      const itemDiscount = item.discount || 0;
      subtotal += itemTotal - itemDiscount;
      
      invoiceItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        discount: itemDiscount,
        total: itemTotal - itemDiscount
      });
    }
    console.log("INV:", invoiceItems )

    const total = subtotal + (invoiceData.tax || 0);

    const invoiceCount = await Invoice.countDocuments({ companyId: req.companyId });
    const invoiceNumber = `INV-${(invoiceCount + 1).toString().padStart(5, '0')}`;

    const invoice = new Invoice({
      ...invoiceData,
    
      invoiceNumber,
      partyId,
      partyName: party.name,
      partyPhone: party.phoneNumber,
      items: invoiceItems,
      subtotal,
      total,
      paymentStatus,
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  
  try {
    const invoices = await Invoice.find({ companyId: req.companyId })
      .sort({ createdAt: -1 })
      .populate('partyId', 'name phoneNumber place');
    res.json(invoices);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getInvoice = async (req, res) => {
  console.log("GetInvoice called:", req.params.id)
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      companyId: req.companyId
    }).populate('partyId', 'name phoneNumber place');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    // console.log("Inv:", invoice)
    
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateInvoicePayment = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    console.log()
    
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id  },
      { paymentStatus },
      { new: true }
    );
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    await Invoice.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add this to your existing controller
exports.getInvoicesByParty = async (req, res) => {
  try {
    const { partyId } = req.params;
    
    const invoices = await Invoice.find({ 
      partyId: partyId,
     
    })
    .sort({ createdAt: -1 })
    .populate('partyId', 'name phoneNumber place');
    
    res.json(invoices);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};