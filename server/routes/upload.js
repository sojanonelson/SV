const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const upload = multer(); // use memory storage

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

router.post('/upload', upload.single('file'), async (req, res) => {
  console.log("CLoudinary..")
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'invoices',
        format: 'pdf',
        resource_type:'raw',
        public_id: `INV_${Date.now()}`,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Upload failed' });
        }
        // Send Cloudinary file URL back to client
        return res.status(200).json({ url: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error('Server error during upload:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
