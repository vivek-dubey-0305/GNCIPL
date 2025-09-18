// controllers/file.controller.js
import { File } from "../models/file.model.js";
import { ActivityLog } from "../models/activityLog.model.js";
// import cloudinary from "cloudinary";
import { destroyOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import xlsx from "xlsx";

import path from "path";
import { fileURLToPath } from "url";
import { cloudinaryFileRefer } from "../utils/constants.utils.js";
import { logActivity } from "../utils/logActivity.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// ================== UPLOAD FILE ==================
export const uploadFile = async (req, res) => {
    try {
        console.log("req.file: ", req.file)
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // 1️⃣ Upload file to cloudinary
        // const result = await cloudinary.v2.uploader.upload(req.file.path, {
        //   folder: "excel-analytics/files",
        //   resource_type: "auto",
        // });

        // 2️⃣ Parse file with SheetJS (optional)
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const result = await uploadOnCloudinary(req?.file?.path, cloudinaryFileRefer, req?.user, req?.file?.originalname)
        console.log("Result: ", result)

        // 3️⃣ Save in DB
        const fileDoc = await File.create({

            uploadedBy: req?.user?._id,
            originalName: req?.file?.originalname,
            format: req?.file?.mimetype,
            size: req?.file?.size,
            cloudinaryId: result?.public_id,
            fileUrl: result?.secure_url,
            parsedSample: sheetData.slice(0, 20),
        });

        // 4️⃣ Log Activity
        await logActivity(req?.user?._id, "upload", `Uploaded file: ${req?.file?.originalname}`, req);
        // await ActivityLog.create({
        //     user: req?.user?._id,
        //     action: "upload",
        //     description: `Uploaded file: ${req?.file?.originalname}`,
        // });

        res.status(201).json({
            message: "File uploaded successfully",
            file: fileDoc,
        });
    } catch (error) {
        res.status(500).json({ message: error?.message });
    }
};


export const getAllFilesByUser = async (req, res) => {
    try {
        const files = await File.find({ uploadedBy: req.user._id }).sort({
            createdAt: -1,
        });

        res.status(200).json({ files });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ================== GET ONE FILE ==================
export const getOneFile = async (req, res) => {
    try {
        const file = await File.findOne({
            _id: req.params.id,
            uploadedBy: req.user._id,
        });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        res.status(200).json({ file });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ================== DELETE FILE ==================
export const deleteFile = async (req, res) => {
    try {
        const file = await File.findOne({
            _id: req.params.id,
            uploadedBy: req.user._id,
        });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // 1️⃣ Delete from Cloudinary
        // await cloudinary.v2.uploader.destroy(file.cloudinaryId);
        await destroyOnCloudinary(file?.cloudinaryId, cloudinaryFileRefer)

        // 2️⃣ Delete from DB
        await file.deleteOne();

        // 3️⃣ Log activity
        await logActivity(req.user._id, "delete", `Deleted file: ${file.originalName}`, req);
        // await ActivityLog.create({
        //     user: req.user._id,
        //     action: "delete",
        //     description: `Deleted file: ${file.originalName}`,
        // });

        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ================== UPDATE FILE META ==================
export const updateFileMeta = async (req, res) => {
    try {
        const { name, tags } = req.body;

        const file = await File.findOneAndUpdate(
            { _id: req.params.id, uploadedBy: req.user._id },
            { $set: { name, tags } },
            { new: true }
        );

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        await logActivity(req?.user?._id, "update", `Updated metadata for file: ${file?.originalName}`, req);
        // await ActivityLog.create({
        //     user: req.user._id,
        //     action: "update",
        //     description: `Updated metadata for file: ${file.originalName}`,
        // });

        res.status(200).json({ file });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
