import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"
import { errorMiddleware } from "./middlewares/error.middleware.js";


import userRouter from "./routes/user.route.js"
import fileRouter from "./routes/file.route.js"
import activityRouter from "./routes/activityLog.route.js"
import adminRouter from "./routes/admin.route.js"
import expenseRouter from "./routes/expense.route.js"
const app = express();


config({ path: "./.env" })


// *===================================
// *Neccessary-Middlewares
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser());

const allowedOrigins = process.env.CORS_ORIGIN.split(",");
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));


app.use("/api/v1/users", userRouter)
app.use("/api/v1/files", fileRouter)
app.use("/api/v1/activity", activityRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/expense", expenseRouter)



app.use(errorMiddleware)
// *End-Of-Neccessary-Middlewares
// *===================================


export { app };