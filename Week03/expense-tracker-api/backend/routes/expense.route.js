// routes/expense.routes.js
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {

    addExpense,
    getUserExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense
} from "../controllers/expense.controller.js";

const router = express.Router();

// Protected routes

// 🔒 All routes protected
router.use(verifyJWT);

router.route("/add").post(addExpense)
router.route("/all").get(getUserExpenses)
router.route("/:id")
    .get(getExpenseById)
    .put(updateExpense)
    .delete(deleteExpense)

export default router;

