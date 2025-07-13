const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function generateDownloadUrl(publicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      public_id: publicId,
      timestamp,
      type: 'upload',
    },
    process.env.CLOUDINARY_API_SECRET
  );

  const url = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/raw/download?` +
    `public_id=${encodeURIComponent(publicId)}&` +
    `type=upload&` +
    `timestamp=${timestamp}&` +
    `signature=${signature}&` +
    `api_key=${process.env.CLOUDINARY_API_KEY}&` +
    `attachment=true&` +
    `target_filename=${publicId.split('/').pop()}.pdf`;

  return url;
}

router.post('/upload', upload.single('file'), async (req, res) => {
    console.log('JJ')
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const publicId = `invoices/INV_${Date.now()}`;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'invoices',
        resource_type: 'raw',
        public_id: publicId,
        format: 'pdf',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Upload failed' });
        }

        const previewUrl = result.secure_url.replace('/upload/', '/raw/upload/');
        const downloadUrl = generateDownloadUrl(result.public_id);

        return res.status(200).json({
          previewUrl,
          downloadUrl,
          cloudinaryPublicId: result.public_id,
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
