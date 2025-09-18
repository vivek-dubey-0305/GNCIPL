// routes/activityLog.routes.js
import express from "express";
import { verifyJWT, customRoles } from "../middlewares/auth.middleware.js";

import {
    getMyActivityLogs,
    getAllActivityLogs,
    clearUserLogs,
} from "../controllers/activityLog.controller.js";

const router = express.Router();

// 🔒 Protect all routes
router.use(verifyJWT);

// ✅ User logs
router.route("/my").get(getMyActivityLogs);

// ✅ Admin logs
router
    .route("/all")
    .get(customRoles("admin"), getAllActivityLogs);

router
    .route("/clear/:id")
    .delete(customRoles("admin"), clearUserLogs);

export default router;
