import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const cloudinaryImageUpload = async (filePath) => {
  // Ensure Cloudinary is configured with the latest environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!filePath) {
      console.log("No file path provided to cloudinaryImageUpload");
      return null;
    }

    console.log("Attempting Cloudinary upload for path:", filePath);

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    console.log("Cloudinary upload successful:", response.url);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return response;
  } catch (error) {
    console.error("Cloudinary upload error details:", {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Cleaned up local file after failure:", filePath);
    }

    return null;
  }
};

export default cloudinaryImageUpload;
