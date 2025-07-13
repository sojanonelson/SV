const Party = require('../models/Party');

exports.createParty = async (req, res) => {
  console.log("CP", req.body)
  try {
    const party = new Party({
      ...req.body
      
    });
    await party.save();
    res.status(201).json(party);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getParties = async (req, res) => {
  try {
    const parties = await Party.find();
    res.json(parties);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateParty = async (req, res) => {
  try {
    const party = await Party.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(party);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteParty = async (req, res) => {
  try {
    await Party.findOneAndDelete({ _id: req.params.id});
    res.json({ message: 'Party deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};