const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const getDoctorProfile = async (req, res) => {
    const doctor = await Doctor.findOne({
        userId: req.user.userId
    });

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor profile not found"
        });
    }

    res.status(200).json({
        success: true,
        doctor
    });
};
const updateDoctorProfile = async (req, res) => {
    const doctor = await Doctor.findOne({
        userId: req.user.userId
    });

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor profile not found"
        });
    }

    const {
        fullName,
        phoneNumber,
        specialization,
        qualifications,
        experienceYears,
        hospitalName,
        clinicAddress,
        consultationFee,
        bio
    } = req.body;
    if (fullName !== undefined && (typeof fullName !== "string" || fullName.trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "Full name must be a non-empty string"
        });
    }
    if (phoneNumber !== undefined && (typeof phoneNumber !== "string" || phoneNumber.trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "Phone number must be a non-empty string "
        });
    }
    if (specialization !== undefined && (typeof specialization !=="string" || specialization.trim() === "")) {
        return res.status(400).json({
            success: false,
            message: "Specialization must be a non-empty string"
        });
    }
    if (
        experienceYears !== undefined &&
        (typeof experienceYears !== "number" || experienceYears < 0)
    ) {
        return res.status(400).json({
            success: false,
            message: "Experience years must be a non-negative number"
        });
    }
    if (
        consultationFee !== undefined &&
        (typeof consultationFee !== "number" || consultationFee < 0)
    ) {
        return res.status(400).json({
            success: false,
            message: "Consultation fee must be a non-negative number"
        });
    }
    if (qualifications !== undefined && typeof qualifications !=="string"){
        return res.status(400).json({
            success: false,
            message: "Qualifications must be a string"
        })
    }
    if (hospitalName !== undefined && typeof hospitalName !=="string"){
        return res.status(400).json({
            success: false,
            message: "Hospital name must be a string"
        })
    }
    if (clinicAddress !== undefined && typeof clinicAddress !=="string"){
        return res.status(400).json({
            success: false,
            message: "Clinic address must be a string"
        })
    }
    if (bio !== undefined && typeof bio !=="string"){
        return res.status(400).json({
            success: false,
            message: "Bio must be a string"
        })
    }

    doctor.fullName = fullName ?? doctor.fullName;
    doctor.phoneNumber = phoneNumber ?? doctor.phoneNumber;
    doctor.specialization = specialization ?? doctor.specialization;
    doctor.qualifications = qualifications ?? doctor.qualifications;
    doctor.experienceYears = experienceYears ?? doctor.experienceYears;
    doctor.hospitalName = hospitalName ?? doctor.hospitalName;
    doctor.clinicAddress = clinicAddress ?? doctor.clinicAddress;
    doctor.consultationFee = consultationFee ?? doctor.consultationFee;
    doctor.bio = bio ?? doctor.bio;

    await doctor.save();

    res.status(200).json({
        success: true,
        message: "Doctor profile updated successfully",
        doctor
    });
};
const getDoctors = async (req, res) => {
    const {
        specialization,
        location,
        maxFee,
        minExperience,
        page = 1,
        limit = 10
    } = req.query;

    let filter = {};

    if (specialization) {
        filter.specialization = {
            $regex: specialization,
            $options: "i"
        };
    }

    if (location) {
        filter.clinicAddress = location;
    }

    if (maxFee) {
        filter.consultationFee = {
            $lte: Number(maxFee)
        };
    }

    if (minExperience) {
        filter.experienceYears = {
            $gte: Number(minExperience)
        };
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const totalDoctors = await Doctor.countDocuments(filter);

    const doctors = await Doctor.find(filter)
        .skip(skip)
        .limit(limitNumber);

    const totalPages = Math.ceil(totalDoctors / limitNumber);

    res.status(200).json({
        success: true,
        totalDoctors,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        doctors
    });
};
const getDoctorSlots = async (req, res) => {
    const { id } = req.params;
    const { date } = req.query;

    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);

        return hours * 60 + minutes;
    };

    const minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    };

    const doctor = await Doctor.findById(id);

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }

    const selectedDate = new Date(date);

    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    const dayName = days[selectedDate.getDay()];

    const availability = doctor.availability[dayName];

    const startMinutes = timeToMinutes(availability.start);
    const endMinutes = timeToMinutes(availability.end);

    const slots = [];

    for (
        let current = startMinutes;
        current < endMinutes;
        current += 30
    ) {
        slots.push(minutesToTime(current));
    }
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
        doctorId: doctor._id,
        appointmentDate: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        status: {
            $in: ["Pending", "Confirmed"]

        }
    });
    const bookedSlots = appointments.map(
        appointment => appointment.timeSlot
    );
    const availableSlots = slots.filter(
        slot => !bookedSlots.includes(slot)
    );

    res.status(200).json({
        success: true,
        date,
        day: dayName,
        availability,
        slots: availableSlots
    });
};
const updateDoctorAvailability = async (req, res) => {
    const doctor = await Doctor.findOne({
        userId: req.user.userId
    });

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor profile not found"
        });
    }

    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
    ];
    if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid availability data"
        });
    }
    const requestedDays = Object.keys(req.body);
    if (!requestedDays.every(day => days.includes(day))) {
        return res.status(400).json({
            success: false,
            message: "Invalid day in availability"
        });
    }

    for (const day of days) {
        const availability = req.body[day];

        if (availability !== undefined) {
            if (
                availability === null ||
                typeof availability !== "object" ||
                Array.isArray(availability)
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${day} must be a valid object`
                });
            }

            const timeKeys = Object.keys(availability);
            if (!timeKeys.every(key => key === "start" || key === "end")) {
                return res.status(400).json({
                    success: false,
                    message: `${day} can only contain start and end fields`
                })
            }
            if (!availability.start || !availability.end) {
                return res.status(400).json({
                    success: false,
                    message: `${day} must have both start and end time`


                });


            }
            if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(availability.start) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(availability.end)) {
                return res.status(400).json({
                    success: false,
                    message: `${day} start and end time must be in HH:mm format`
                });
            }
            const startMinutes = timeToMinutes(availability.start);
            const endMinutes = timeToMinutes(availability.end);

            if (startMinutes >= endMinutes) {
                return res.status(400).json({
                    success: false,
                    message: `${day} start time must be earlier than end time`
                });
            }
        }
    }

    doctor.availability = req.body;

    await doctor.save();

    res.status(200).json({
        success: true,
        message: "Doctor availability updated successfully",
        availability: doctor.availability
    });
};
module.exports = {
    getDoctorProfile,
    updateDoctorProfile,
    getDoctors,
    getDoctorSlots,
    updateDoctorAvailability
};
