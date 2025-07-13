const Company = require('../models/Company');

exports.getCompany = async (req, res) => {
  console.log("Company ")
  try {
    const company = await Company.findOne(); // Fetch the only company
    res.json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.updateCompany = async (req, res) => {
  try {
    // Check if the ID is valid
    if (!req.params.id) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    // Attempt to find and update the company
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Check if the company was found and updated
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Return the updated company
    res.json(company);
  } catch (error) {
    // Handle specific Mongoose errors
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    // Handle other errors
    res.status(500).json({ message: error.message || "An error occurred while updating the company" });
  }
};
