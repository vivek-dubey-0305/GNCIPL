import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import crypto from "crypto"

import { User } from "../models/user.model.js";
import { destroyOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/mail.utils.js";
import { cookieToken } from "../utils/cookie.utils.js";
import { cloudinaryAvatarRefer } from "../utils/constants.utils.js";

// *================================================================================
function generateEmailLinkTemplate(Token) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f7;">
<div>
<h3>
<a href="http://localhost:3000/password/reset/${Token}">Click here to reset password</a>
</h3>
</div>
</body>
</html>`;
}

function generateEmailTemplate(verificationCode, companyName = "Zidio", logoUrl = "") {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #ffffff; color: #333;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
          <tr>
              <td align="center" style="padding: 20px 0;">   
                  <table align="center" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #e5e5e5; border-radius: 8px; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
                      <tr>
                          <td style="padding: 25px; text-align: center; background-color: #f8f8f8; border-bottom: 1px solid #eeeeee;">
                              ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" width="120" style="margin-bottom: 10px;" />` : `<h2>${companyName}</h2>`}
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 30px; text-align: center;">
                              <h1 style="font-size: 22px; color: #333;">Verify Your Email</h1>
                              <p style="font-size: 16px; color: #666;">Use the code below to verify your email address:</p>
                              <div style="font-size: 28px; font-weight: bold; padding: 12px 24px; border: 2px solid #333; display: inline-block; margin: 15px 0;">
                                  ${verificationCode}
                              </div>
                              <p style="font-size: 14px; color: #777;">If you didn’t request this, ignore this email.</p>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 20px; text-align: center; background-color: #f8f8f8; border-top: 1px solid #eeeeee;">
                              <p style="font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>`;
}
// *================================================================================


// *Refresh-Access Token Route
// !watch out
const refreshAccessToken = asyncHandler(async (req, res, next) => {
    // console.log("Refreshing the accessToken...")
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    // console.log("INCOMING REFRESH TOKEN", incomingRefreshToken)
    if (!incomingRefreshToken) {
        // console.error("(refresh)")
        return next(new ErrorHandler("Unauthorises Request", 401))
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id);
        // console.log("USER FOUND", user)
        if (!user || user.refreshToken !== incomingRefreshToken) {
            // console.error("Invalid or Expired Refresh Token")
            return next(new ErrorHandler("Invalid or Expired Refresh Token", 401))

        }


        // const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)
        cookieToken(user, res)

    } catch (error) {
        return next(new ErrorHandler(error?.message || "Invalid Refresh Token", 401))
        // throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
})


// *Register Route
const registerUser = asyncHandler(async (req, res, next) => {


    console.log("SomeOne hitted here")
    const { fullName, email, phone, password } = req.body;
    console.log("fullName : ", fullName)

    const requiredFields = [fullName, email, phone.toString(), password]

    const checkFields = { email, phone }

    if (requiredFields.some((field) => field.trim() === "")) {
        console.log("All Fields are required")
        return next(new ErrorHandler("All fields are required", 400))
    }

    const existingUser = await User.findOne({
        $or: Object.entries(checkFields).map(([key, value]) => ({ [key]: value }))
    })


    if (existingUser) {
        // console.log("ExistingUser")
        // console.log(existingUser)
        const duplicateField = Object.keys(checkFields).find(key => existingUser[key].toString().toLowerCase() === checkFields[key].toString().toLowerCase())
        // console.log("duplicateFiels:\n", duplicateField, checkFields[duplicateField], existingUser[duplicateField])
        return res.status(400).json({
            success: false,
            message: `User already exist with the same ${duplicateField}: "${checkFields[duplicateField]}"\nPlease try unique one!`,
            duplicateField
        })
        // return next(new ErrorHandler(`User already exist with the same ${duplicateField}: "${checkFields[duplicateField]}"\nPlease try unique one!`, 400))
    }

    try {
        const user = await User.create({
            fullName, email, phone, password
        })


        await cookieToken(user, res)



    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            console.error("⚠️ Validation Error:", error.message);

            // Optional: get individual field messages
            Object.values(error.errors).forEach(err => {
                console.log(`Field: ${err.path} → ${err.message}`);

                return next(new ErrorHandler(`Field: ${err.path} → ${err.message}`));
            });

        } else {
            console.error("❌ Unknown Error:", error);
            return false;
        }
    }

})

// ! ---take care of passwors -we don't wanna show it in response as the user signUp or login

// *Login Route
const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    console.log(email, password)
    try {
        if (!email || !password) {
            console.error("Login all fields req")
            return next(new ErrorHandler("Please fill in all fields", 400));
        }

        const user = await User.findOne({ email })


        if (!user) {
            return next(new ErrorHandler("Invalid Credentials", 401))
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            return next(new ErrorHandler("Invalid credentials", 400))
        }

        cookieToken(user, res)
    } catch (error) {
        return next(new ErrorHandler(`Something went wrong..details - ${error.message}`, 500))
    }

})

// *Logout Route
const logoutUser = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id

        try {
            const user = await User.findByIdAndUpdate(
                userId,
                {
                    // $set: { isVerified: false },
                    $unset: { refreshToken: "" } // ✅ Removes refreshToken field
                },

                {
                    new: true
                }
            )
        } catch (error) {
            console.error("Unable to logout USer:\n", error)
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                success: true,
                message: "User Logged Out Successfully!",
            })
    } catch (error) {
        console.error("Logout Error:\n", error)
        return next(new ErrorHandler(`Error logout session :\n${error}`, 400))
    }
})

// *OTP ROUTE ---chceck if GET
const sendOtpToUser = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    console.log("USERID", userId)
    if (!userId) {
        // console.error(" Email not provided")
        return next(new ErrorHandler("You are unauthorised to get otp, please register / login to continue", 400))
    }
    const user = await User.findById(userId)
    if (!user?.email) {
        // console.error("Wrong Email")
        return next(new ErrorHandler("Please provide email used for account creation!"))
    }

    const OTP = await user.generateVerificationCode()
    console.log("OTP: ", OTP)
    await user.save()

    try {
        console.log(user.email)
        let email = user?.email

        const message = generateEmailTemplate(OTP);
        const mailResponse = await sendEmail({
            email,
            subject: "YOUR VERIFICATION CODE",
            message
        })
        console.log("MailResponse", mailResponse)
        return res.status(200).json({
            success: true,
            message: `Code sent successfully to ${email}`
        })

    } catch (error) {
        console.log("Email Error:\n", error.message || error)
        return next(new ErrorHandler(`Unable to send email to ${user.email}\n Error ${error.message || error}`, 400))
        // throw new ErrorHandler("Failed to send verification Code", 500)
    }
})

// *Verify Route
// ! -- check for the cookies down
const verifyOtpForUser = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;
    console.log("REQ otp", email, otp)
    console.log("REQ otp", { email, otp })
    if (!email) {
        // console.error("Email X (verify)")
        return next(new ErrorHandler("Enter the email to recive OTP", 400))
    }


    if (!otp) {
        // console.error("Otp X (verify)")
        return next(new ErrorHandler(`Please enter OTP sent to you mail: ${email} to verify Email`, 400))
    }

    const user = await User.findOne({ email });

    if (!user) {
        // console.error("User not found")
        return next(new ErrorHandler("INVALID Email", 400))
    }
    // console.log("USER:\n", user)
    // console.log("User.verificationCode:", user.verificationCode)
    // console.log("User.verificationCode:", user.verificationCode === Number(otp))
    // console.log("User.verificationCode:", !user.verificationCode === Number(otp))
    // console.log("User.verificationCode:", !user.verificationCode !== Number(otp))

    if (!user.verificationCode || user.verificationCode !== Number(otp)) {
        // console.error("Invalid OTP")
        return next(new ErrorHandler("INVALID OTP", 400))
    }

    if (user.verificationCodeExpire < Date.now()) {
        // console.error("OTP Expired")
        return next(new ErrorHandler("OTP Expired", 400))
    }

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken;
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;

    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        sameSite: "Strict"
    }

    const resUser = await User.findById(user._id).select("-password -refreshToken");
    return res.status(200).
        cookie("accessToken", accessToken, options)
        .
        cookie("refreshToken", refreshToken, options).
        json({
            success: true,
            message: `${email} verified successfully\nUser Created`,
            user: resUser, accessToken, refreshToken
        })
})


// *Reset Password Link
const sendResetPasswordLinkToUser = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    console.log("HERE")
    if (!email) {
        // console.error(" Email not provided")
        return next(new ErrorHandler("Please provide the email to sned otp", 400))
    }
    const user = await User.findOne({ email })
    if (!user) {
        // console.error("Wrong Email")
        return next(new ErrorHandler("Please provide email used for account creation!"))
    }

    const Token = await user.generateResetPasswordLink()
    // console.log("OTP: ", OTP)
    await user.save()

    try {

        const message = generateEmailLinkTemplate(Token);
        const mailRes = await sendEmail({
            email,
            subject: "YOUR RESET PASSWORD LINK",
            message
        })
        console.log("MailRes", mailRes)
        return res.status(200).json({
            success: true,
            message: `Email sent successfully to ${email}`
        })

    } catch (error) {
        console.log("Email Error:\n", error)
        return next(new ErrorHandler(`Unable to send email to ${email}\n Error ${error.message || error}`, 400))
        // throw new ErrorHandler("Failed to send verification Code", 500)
    }
})


// *reset Pasword vai link
const resetPassword = asyncHandler(async (req, res, next) => {
    // const {token} = req.query;
    const { password } = req.body
    const token = req.params.token
    console.log("token", token)

    const encryptedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

    console.log("encryptedToken", encryptedToken)
    const user = await User.findOne({
        forgotPasswordToken: encryptedToken,
        forgotPasswordTokenExpiry: { $gt: Date.now() }
    })

    console.log(password)
    // console.log(token)
    // console.log("REQ otp", req.body)
    if (!user) {
        // console.error("Email X (verify)")
        return next(new ErrorHandler("Invalid link", 400))
    }

    console.log("first")

    if (!user.forgotPasswordToken || user.forgotPasswordToken !== encryptedToken) {
        // console.error("Invalid OTP")
        return next(new ErrorHandler("INVALID Link token", 400))
    }

    if (user.forgotPasswordTokenExpiry < Date.now()) {
        // console.error("OTP Expired")
        return next(new ErrorHandler("Link Expired", 400))
    }

    user.password = password



    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;

    await user.save({ validateBeforeSave: true });

    return res.status(200).
        json({
            success: true,
            message: `Password for ${user.fullName} changed!`,
        })
})

// *Change Password ---
// !--check for the minimum lenght before save
const changeCurrentPassword = asyncHandler(async (req, res, next) => {

    const { currentPassword, newPassword, confirmPassword } = req.body;



    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);



    if (!isPasswordCorrect) {
        // throw new ApiError(401, "");
        return next(new ErrorHandler("Invalid old password", 401))
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("Confirm Password dindn't match the new Password!", 401))
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
        success: true,
        message: "Password update Successfully!"
    })
})



// *Update Profile User
const updateUserProfile = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id
    const { fullName, email, phone, gender, social_links = {} } = req.body
    console.log("req.body[registerUser]:\n", req.body)

    const requiredFields = [email, phone]
    // console.log("requiredFields", requiredFields)

    const checkFields = { email, phone }
    // console.log("Check Fields", checkFields)

    // *Required Fields_____________________________________________
    if (!fullName || !email || !phone) {
        console.error("emptyError")
        return next(new ErrorHandler("All Fields are required", 400))
    }


    // *Check for an existing User__________________________________________________
    const existingUser = await User.findOne({
        _id: { $ne: userId }, // Exclude the current user
        $or: Object.entries(checkFields).map(([key, value]) => ({ [key]: value }))
    })

    if (existingUser) {
        const duplicateField = Object.keys(checkFields).find(key => existingUser[key].toString().toLowerCase() === checkFields[key].toString().toLowerCase())
        // console.log("duplicateFiels:\n", duplicateField, checkFields[duplicateField], existingUser[duplicateField])
        return res.status(400).json({
            success: false,
            message: `User already exist with the same ${duplicateField}: "${checkFields[duplicateField]}"\nPlease try unique one!`,
            duplicateField
        })
        // return next(new ErrorHandler(`User already exist with the same ${duplicateField}: "${checkFields[duplicateField]}"\nPlease try unique one!`, 400))
    }

    try {
        Object.entries(social_links).forEach(([platform, url]) => {
            if (url) {
                try {
                    // Ensure URL is valid
                    const parsed = new URL(url);

                    // 1. Protocol must be HTTPS
                    if (parsed.protocol !== "https:") {
                        throw new Error(`${platform} link must start with https://`);
                    }

                    // 2. Hostname must contain platform domain (except for website)
                    if (platform !== "website" && !parsed.hostname.includes(`${platform}.com`)) {
                        throw new Error(`${platform} link must be a valid ${platform}.com domain`);
                    }

                } catch (e) {
                    throw new Error(`${platform} link is invalid. Please enter a valid full https link.`);
                }
            }
        });

    } catch (error) {
        console.log(error)
        return res.status(403).json({
            error: "You must provide full links with http(s) included"
        });
    }




    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, email, phone, gender, social_links },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser
    });


})


// *Update Profile User
const updateUserAvatar = asyncHandler(async (req, res, next) => {
    console.log("reques.files: ", req.file)
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        return next(new ErrorHandler("Avatar File is Missing", 401))
    }

    const user = await User.findById(req?.user?._id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // *Delete the previous file
    // ----------------------------------------------------------------
    const previousAvatar = user.avatar?.public_id;
    console.log("previousAvatar", previousAvatar)

    if (previousAvatar) {
        const deleteAvatarResponse = await destroyOnCloudinary(previousAvatar, cloudinaryAvatarRefer);
        console.log("deletedAvatarr:response--", deleteAvatarResponse);
    } else {
        console.log("No previous avatr found")
    }
    // ----------------------------------------------------------------


    // *UPLOADING NEW AVATAR

    const newAvatar = await uploadOnCloudinary(avatarLocalPath, cloudinaryAvatarRefer, req?.user, req?.file?.originalname);
    console.log("Previous URL: ", newAvatar)

    if (!newAvatar || !newAvatar.url || !newAvatar.public_id) {
        return next(new ErrorHandler("Error while uploading avatar!", 500));
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    "avatar.public_id": newAvatar.public_id,
                    "avatar.secure_url": newAvatar.secure_url,
                },
            },
            { new: true }
        ).select("-password")


        console.log("NEW URL: ", newAvatar);
        console.log("NEW URL: ", updatedUser.avatar);
        console.log("Updated User Avatar URL:", updatedUser.avatar.secure_url);

        return res
            .status(200)
            .json({
                success: true,
                user: updatedUser,
                message: "Avatar Updated Successfully!"
            })
    } catch (error) {
        console.error("error", error)
        const deleteAvatarResponse = await destroyOnCloudinary(newAvatar?.public_id, cloudinaryAvatarRefer);
        console.log("deleteAvatarResponse", deleteAvatarResponse);
        return next(new ErrorHandler(`Unable to update user profle\n ${error}`, 401))
    }
})

// *User DashBoard - just getting the loggedIn Info of user
const getLoggedInUserInfo = asyncHandler(async (req, res, next) => {
    console.log("Over here")
    const user = await User.findById(req.user._id).select("-password -refreshToken")

    res.status(200).json({
        success: true,
        user
    })
})

// *Delete User
const deleteUser = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user?._id;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User Not Found", 404))

        }

        // Delete the user
        await User.findByIdAndDelete(userId);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return next(new ErrorHandler("Internal Server Error", 500))
    }
});


export {
    refreshAccessToken,
    registerUser,
    loginUser,
    logoutUser,
    sendOtpToUser,
    verifyOtpForUser,
    sendResetPasswordLinkToUser,
    resetPassword,
    getLoggedInUserInfo,
    changeCurrentPassword,
    updateUserProfile,
    updateUserAvatar,
    deleteUser,
}