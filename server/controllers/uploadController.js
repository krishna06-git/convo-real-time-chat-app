const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary from env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store uploads directly on Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(file.originalname);
    return {
      folder: 'convo-uploads',
      resource_type: isImage ? 'image' : 'raw',
      // use_filename to keep original name info
      use_filename: false,
      unique_filename: true,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'video/mp4',
    'audio/mpeg',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// POST /api/upload
const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Cloudinary puts the URL in req.file.path
    const fileUrl = req.file.path;
    const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(req.file.originalname);

    res.json({
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      messageType: isImage ? 'image' : 'file',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { upload, uploadFile };
