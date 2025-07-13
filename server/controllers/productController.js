const Product = require('../models/Product');

function generateSKU() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sku = 'SV'; // Starting with 'SV'

  // Generate the remaining 4 characters
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    sku += characters[randomIndex];
  }

  return sku;
}

// Modified createProduct function
exports.createProduct = async (req, res) => {
  console.log("Adding new product")
 
  try {
    const sku = generateSKU(); // Generate the SKU

    const product = new Product({
      ...req.body,
    
      sku: sku // Add the generated SKU to the product
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  const{id}= req.params
  console.log("Done")
  try {
    const products = await Product.find({ _id: id})
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};