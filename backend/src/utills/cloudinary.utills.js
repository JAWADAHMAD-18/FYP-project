import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryImageUpload = async (filePath) => {
  try {
    if (!filePath) return;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("the image is uploaded successfully", response.url);
    fs.unlinkSync(filePath);
    return response;
  } catch (error) {
    console.log("cloudinary image upload error", error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return null;
  }
};

export default cloudinaryImageUpload;
