import { Expense } from "../models/expense.model.js";

// *Create new expense
export const addExpense = async (req, res) => {
    try {
        const { amount, category, description, date, isRecurring } = req.body;

        const expense = await Expense.create({
            user: req.user._id,
            amount,
            category,
            description,
            date,
            isRecurring
        });

        res.status(201).json({ success: true, expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// *Get all expenses for logged in user
export const getUserExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json({ success: true, expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// *Get single expense by ID
export const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
        if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

        res.status(200).json({ success: true, expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// *Update expense
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );

        if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

        res.status(200).json({ success: true, expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// *Delete expense
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });

        if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

        res.status(200).json({ success: true, message: "Expense deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
