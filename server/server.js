require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const testRoutes = require("./routes/testRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const protectedRoutes = require("./routes/protectedRoutes");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const cors = require("cors");
const rateLimit = require("express-rate-limit");


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        success: false,
        message: "Too many requests, please try again later"
    }
});

const app = express();
app.use(
    cors({
        origin: "http://localhost:8443"
    })
);
connectDB();
app.use(express.json());


const myMiddleware = (req, res, next) => {
    console.log(req.method, req.url);
    next();
};

app.use(myMiddleware);

app.get("/", (req, res) => {
    res.send("Welcome to MediLink!");
});

app.use("/api/auth",authLimiter, authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});