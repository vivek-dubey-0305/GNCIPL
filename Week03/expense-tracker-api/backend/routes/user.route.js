import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    registerUser,
    loginUser,
    logoutUser,
    sendOtpToUser,
    verifyOtpForUser,
    sendResetPasswordLinkToUser,
    resetPassword,
    changeCurrentPassword,
    getLoggedInUserInfo,
    updateUserProfile,
    deleteUser,
    updateUserAvatar
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router()

// *==========================
// *User Routes

// *Register and login routes
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

// *OTP routes
router.route("/otp/send").post(verifyJWT, sendOtpToUser)
router.route("/otp/verify").post(verifyOtpForUser)

// *Forgot password flow
router.route("/password/reset").post(sendResetPasswordLinkToUser)
router.route("/password/reset/:token").post(resetPassword)

// *Authenticated user routes
router.route("/password/update").post(verifyJWT, changeCurrentPassword)
router.route("/dashboard").get(verifyJWT, getLoggedInUserInfo)
router.route("/profile/update").post(verifyJWT, updateUserProfile)
router.route("/profile/avatar/update").post(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/profile/delete").delete(verifyJWT, deleteUser)
router.route("/logout").get(verifyJWT, logoutUser)


export default router;