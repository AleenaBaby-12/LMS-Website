const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary Config Check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lms_uploads',
        resource_type: 'auto', // Important for video/pdf support
        // allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'mp4', 'mov'] // Often causes issues if not function
    }
});

const upload = multer({ storage: storage });

const uploadFile = (req, res) => {
    if (!req.file) {
        console.error('Upload Error: No file received');
        return res.status(400).send('No file uploaded');
    }
    console.log('File Uploaded to Cloudinary:', req.file.path);
    // Return an object with url property for frontend compatibility
    res.json({ url: req.file.path });
};

module.exports = {
    upload,
    uploadFile
};
