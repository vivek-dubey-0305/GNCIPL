import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ["Food", "Travel", "Bills", "Rent", "Shopping", "Other"],
    default: "Other",
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export const Expense = mongoose.model("Expense", expenseSchema);
