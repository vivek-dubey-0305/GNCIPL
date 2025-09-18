// routes/file.routes.js
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  uploadFile,
  getAllFilesByUser,
  getOneFile,
  deleteFile,
  updateFileMeta,
} from "../controllers/file.controller.js";

const router = express.Router();

// 🔒 All routes protected
router.use(verifyJWT);

router.route("/upload").post(upload.single("file"), uploadFile);
router.route("/all").get(getAllFilesByUser);
router.route("/:id").get(getOneFile).delete(deleteFile).put(updateFileMeta);

export default router;
