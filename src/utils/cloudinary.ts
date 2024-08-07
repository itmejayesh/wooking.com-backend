import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    secure: true,
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

export const uploadImageOnCloudinary = async (localFilePath: string): Promise<string | null> => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        console.log("image upload on cloudinary", response.url);
        fs.unlinkSync(localFilePath);
        return response.url;
    } catch (err) {
        fs.unlinkSync(localFilePath);
        console.error("Error uploading image to Cloudinary:", err);
        return null;
    }
};