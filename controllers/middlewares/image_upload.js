const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const uuid = require("uuid");

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECERET,
});

// Multer cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "product_images",
      allowed_formats: ["jpg", "png", "webp"],
      public_id: uuid.v4(),
    };
  },
});

const upload = multer({ storage: cloudinaryStorage });

const fileUtilConfig = (req, res, next) => {
  async function deleteFile() {
    if (req.file && req.file.filename) {
      const delResult = await cloudinary.uploader.destroy(req.file.filename);
      console.log("image deleted: ", delResult);
    }
  }

  req.deleteFile = deleteFile;
  next();
};

module.exports = {
  upload,
  fileUtilConfig,
};
