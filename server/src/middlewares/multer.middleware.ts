import multer from "multer";
import path from "path";
import fs from "fs";
import mime from "mime-types"; // install via: npm install mime-types

// Upload folder: project-root/public/uploads
const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");

// Ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created uploads folder:", uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    // Get extension from original file name
    let ext = path.extname(file.originalname);

    // If missing extension, get from MIME type
    if (!ext) {
      const mimeExt = mime.extension(file.mimetype);
      ext = mimeExt ? "." + mimeExt : "";
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "image-" + uniqueSuffix + ext.toLowerCase());
  },
});

export const saveImgOnDisk = multer({ storage });
