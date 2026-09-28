const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware =require("../middleware/roleMiddleware");

const {
    createAppointment,
    getAppointments,
    cancelAppointment,
    getDoctorAppointments,
    confirmAppointment,
    rejectAppointment,
    completeAppointment
} = require("../controllers/appointmentController");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    createAppointment
);
router.get("/my",authMiddleware,roleMiddleware("patient"),getAppointments);
router.put(
    "/:id/cancel",
    authMiddleware,
    roleMiddleware("patient"),
    cancelAppointment
);
router.get(
    "/doctor",
    authMiddleware,
    roleMiddleware("doctor"),
    getDoctorAppointments
);

router.put(
    "/:id/confirm",
    authMiddleware,
    roleMiddleware("doctor"),
    confirmAppointment
);
router.put(
    "/:id/reject",
    authMiddleware,
    roleMiddleware("doctor"),
    rejectAppointment
);

router.put(
    "/:id/complete",
    authMiddleware,
    roleMiddleware("doctor"),
    completeAppointment
);

module.exports = router;