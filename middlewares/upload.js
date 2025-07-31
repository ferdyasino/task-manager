const multer = require("multer");
const path = require("path");

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

// Allowed file types
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/ogg"
];

// File filter
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images, PDFs, and short videos are allowed."), false);
  }
};

// Multer upload with size limit (20MB)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});

module.exports = upload;
