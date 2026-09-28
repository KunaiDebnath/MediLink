const Patient = require("../models/Patient");

const getPatientProfile = async (req, res) => {
    const patient = await Patient.findOne({
        userId: req.user.userId
    });

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: "Patient profile not found"
        });
    }

    res.status(200).json({
        success: true,
        patient
    });
};
const updatePatientProfile = async (req, res) => {
    const patient = await Patient.findOne({
        userId: req.user.userId
    });

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: "Patient profile not found"
        });
    }

    if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
    ) {
        return res.status(400).json({
            success: false,
            message: "Request body must be a valid object"
        });
    }

    const {
        fullName,
        phoneNumber,
        dateOfBirth,
        gender,
        bloodGroup,
        address
    } = req.body;
    if (
        fullName !== undefined &&
        (typeof fullName !== "string" || fullName.trim() === "")
    ) {
        return res.status(400).json({
            success: false,
            message: "Full name must be a non-empty string"
        });
    }
    if (
        phoneNumber !== undefined &&
        (typeof phoneNumber !== "string" || phoneNumber.trim() === "")
    ) {
        return res.status(400).json({
            success: false,
            message: "Phone Number must be a non-empty string"
        });
    }
    if (
        dateOfBirth !== undefined &&
        (typeof dateOfBirth !== "string" || dateOfBirth.trim() === "")
    ) {
        return res.status(400).json({
            success: false,
            message: "Date of Birth must be a non-empty string"
        });
    }

    if (dateOfBirth !== undefined) {

        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
            return res.status(400).json({
                success: false,
                message: "Date of birth must be in YYYY-MM-DD format"
            });
        }
        const dob = new Date(dateOfBirth);
        if (isNaN(dob.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date of birth"
            });
        }
        const [year, month, day] = dateOfBirth.split("-").map(Number);
        if (
            dob.getFullYear() !== year ||
            dob.getMonth() + 1 !== month ||
            dob.getDate() !== day
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid date of birth"
            });
        }
        const today = new Date();
        if (dob > today) {
            return res.status(400).json({
                success: false,
                message: "Date of birth cannot be in the future"
            });
        }

    }
    if (
        gender !== undefined &&
        (typeof gender !== "string" || gender.trim() === "")
    ) {
        return res.status(400).json({
            success: false,
            message: "Gender must be a non-empty string"
        });
    }
    if (
        bloodGroup !== undefined &&
        (typeof bloodGroup !== "string" || bloodGroup.trim() === "")
    ) {
        return res.status(400).json({
            success: false,
            message: "Blood Group must be a non-empty string"
        });
    }

    if (
        address !== undefined &&
        (typeof address !== "string" || address.trim() === "")
    ) {
        return res.status(400).json({
            success: false,
            message: "Address must be a non-empty string"
        });
    }


    patient.fullName = fullName ?? patient.fullName;
    patient.phoneNumber = phoneNumber ?? patient.phoneNumber;
    patient.dateOfBirth = dateOfBirth ?? patient.dateOfBirth;
    patient.gender = gender ?? patient.gender;
    patient.bloodGroup = bloodGroup ?? patient.bloodGroup;
    patient.address = address ?? patient.address;

    await patient.save();

    res.status(200).json({
        success: true,
        message: "Patient profile updated successfully",
        patient
    });
};

module.exports = {
    getPatientProfile,
    updatePatientProfile
};