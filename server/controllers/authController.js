const Company = require('../models/Company');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.createCompany = async (req, res) => {
  console.log("📩 Incoming request to register company");
  console.log("🔥 Full req.body:", req.body);

  try {
    const { fssaiNumber, gstNumber, phoneNumber, alternateNumber, ownerName, email, logo, password } = req.body;

    
    console.log("✅ fssaiNumber:", fssaiNumber);
    console.log("✅ gstNumber:", gstNumber);
    console.log("✅ phoneNumber:", phoneNumber);
    console.log("✅ alternateNumber:", alternateNumber);
    console.log("✅ ownerName:", ownerName);
    console.log("✅ email:", email);
    console.log("✅ logo URL:", logo);
    console.log("✅ Password received:", !!password);
   
    const existingCompany = await Company.findOne();
    if (existingCompany) {
      console.warn("⚠️ Company already exists, blocking new registration");
      return res.status(400).json({ message: 'Only one company can be registered' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const company = new Company({
      fssaiNumber,
      gstNumber,
      phoneNumber,
      alternateNumber,
      ownerName,
      email,
      logo,
      password: hashedPassword
    });

    await company.save();
    console.log("✅ Company saved successfully");

    
    const token = jwt.sign(
      { companyId: company._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ token, company });
  } catch (error) {
    console.error("❌ Error during registration:", error.message);
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  console.log("Login")
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { companyId: company._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, company });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.checkCompany = async (req, res) => {
  console.log("HEYYYY")
  try {
    const company = await Company.findOne();
    res.json({ exists: !!company });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};