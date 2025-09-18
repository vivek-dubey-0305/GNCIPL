import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv";

import fs from "fs";
import path from "path";
import { cloudinaryAvatarRefer } from "./constants.utils.js";

// Load environment variables
dotenv.config();



// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET


    // Click 'View API Keys' above to copy your API secret
    // api_environment_varaible: "CLOUDINARY_URL=cloudinary://455425321874346:GQAYGl3Rb9VbSXoKVqutWiGDWU4@dpaoea2t6"
});


const uploadOnCloudinary = async (localFilePath, refer = "", user = null, originalName = "") => {
    console.log(process.env.CLOUDINARY_CLOUD_NAME); // should print your Cloudinary cloud name
    console.log(process.env.CLOUDINARY_API_KEY);    // should print your Cloudinary API key
    console.log(process.env.CLOUDINARY_API_SECRET); // should print your Cloudinary API secret
    try {
        console.log("------------------CLOUDINARY.JS------------------")

        if (!localFilePath) {
            console.log("under the if condition, no files have been uploaded");
            return "No file have uploaded";

            // J:\_CODE.dubeY\_WEB-DEV\Learning_path\CONNECT_FRONTEND_BACKEND\public
        }
        console.log("LOCAL FILE PATH: ", localFilePath)

        // ✅ build custom filename
        let publicId = path.parse(originalName).name; // default: original file name (without ext)
        if (user?.fullName) {
            const safeName = user.fullName.replace(/\s+/g, "-"); // sanitize spaces
            const ext = path.extname(originalName); // .xlsx / .png
            publicId = refer === cloudinaryAvatarRefer
                ? `${safeName}-avatar`
                : `${safeName}-file${ext}`;
        }

        // *-------------
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            // folder: refer === "user" ? "greedUsers" : "greedProducts",
            folder: refer === cloudinaryAvatarRefer ? "GNCIPL/avatars" : "GNCIPL/files",
            resource_type: refer === cloudinaryAvatarRefer ? "image" : "raw",
            public_id: publicId,    // ✅ custom name
            use_filename: true,     // ✅ keep original filename if no user provided
            unique_filename: false, // ✅ don’t add random hash
            overwrite: true,
        });
        console.log("Almost Uploaded")

        //file has been uploaded successfully
        console.log("FILE UPLOADED ON CLOUDINARY", response.url);
        // fs.unlinkSync(localFilePath);
        // console.log("UNLINKED SUCCESSFULLY")
        return response;

    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        fs.unlinkSync(localFilePath);
        return null;
    } finally {
        fs.unlinkSync(localFilePath);
    }
}


const destroyOnCloudinary = async (imageId, refer = "") => {
    console.log(process.env.CLOUDINARY_CLOUD_NAME); // should print your Cloudinary cloud name
    console.log(process.env.CLOUDINARY_API_KEY);    // should print your Cloudinary API key
    console.log(process.env.CLOUDINARY_API_SECRET); // should print your Cloudinary API secret
    try {
        console.log("------------------CLOUDINARY.JS*------------------")


        // upload file on cloudinary
        const response = await cloudinary.uploader.destroy(imageId, {
            // folder: refer === "user" ? "greedUsers" : "greedProducts",
            // resource_type: "image"
            folder: refer === cloudinaryAvatarRefer ? "GNCIPL/avatars" : "GNCIPL/files",
            resource_type: refer === cloudinaryAvatarRefer ? "image" : "raw",



        });

        //file has been uploaded successfully
        console.log("FILE DESTROYED ON CLOUDINARY", response);
        // fs.unlinkSync(localFilePath);
        // console.log("UNLINKED SUCCESSFULLY")
        return response;

    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return null;
    } finally {
        console.log("FinallY....");
    }
}


export { uploadOnCloudinary, destroyOnCloudinary };