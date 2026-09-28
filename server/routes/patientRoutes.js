const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getPatientProfile, updatePatientProfile } = require("../controllers/patientController");

const router = express.Router();

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("patient"),
    getPatientProfile
);
router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("patient"),
    updatePatientProfile
);

module.exports = router;