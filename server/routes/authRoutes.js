const express = require("express");
const authMiddleware =require("../middleware/authMiddleware");
const { registerPatient, loginUser, registerDoctor,getMe
 } = require("../controllers/authController");

const router = express.Router();

router.post("/register/patient", registerPatient);
router.post("/login", loginUser);
router.post("/register/doctor", registerDoctor);
router.get(
    "/me",
    authMiddleware,
    getMe
);
module.exports = router;