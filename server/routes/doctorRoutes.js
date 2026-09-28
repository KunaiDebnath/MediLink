const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
    getDoctorProfile,
    updateDoctorProfile,
    getDoctors,
    getDoctorSlots,
    updateDoctorAvailability
} = require("../controllers/doctorController");

const router = express.Router();

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("doctor"),
    getDoctorProfile
);
router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("doctor"),
    updateDoctorProfile
);
router.get("/", getDoctors);
router.get("/:id/slots", getDoctorSlots);
router.put(
    "/availability",
    authMiddleware,
    roleMiddleware("doctor"),
    updateDoctorAvailability
);

module.exports = router;