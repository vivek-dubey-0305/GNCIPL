// // models/activityLog.model.js
// import mongoose, { Schema } from "mongoose";

// const activityLogSchema = new Schema(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     action: {
//       type: String,
//       required: true,
//       enum: ["upload", "delete", "update", "login", "logout", "register"],
//     },
//     description: {
//       type: String,
//       default: "",
//     },
//     ipAddress: {
//       type: String,
//     },
//     userAgent: {
//       type: String,
//     },
//   },
//   { timestamps: true }
// );

// export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);


// models/activityLog.model.js
import mongoose, { Schema } from "mongoose";

const actionSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["upload", "delete", "update", "login", "logout", "register"],
    },
    description: { type: String, default: "" },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

const activityLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one log doc per user
    },
    activities: [actionSchema], // array of actions
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
