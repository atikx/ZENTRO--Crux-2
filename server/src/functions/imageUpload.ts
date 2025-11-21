import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an image
const uploadOnCloudinary = async (filePath: any) => {
  try {
    if (!filePath) {
      throw new Error("File path is required");
    }
    const imgRes = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto"
    });
    return imgRes.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    fs.unlinkSync(filePath);
    throw error;
  }
};

export { uploadOnCloudinary };
