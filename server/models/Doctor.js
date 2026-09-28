const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        fullName: {
            type: String,
            required: true
        },

        phoneNumber: {
            type: String,
            required: true
        },

        specialization: {
            type: String,
            required: true
        },

        qualifications: {
            type: String
        },

        experienceYears: {
            type: Number
        },

        hospitalName: {
            type: String
        },

        clinicAddress: {
            type: String
        },

        consultationFee: {
            type: Number
        },

        bio: {
            type: String
        },

        availability: {
            monday: {
                start: String,
                end: String
            },

            tuesday: {
                start: String,
                end: String
            },

            wednesday: {
                start: String,
                end: String
            },

            thursday: {
                start: String,
                end: String
            },

            friday: {
                start: String,
                end: String
            },

            saturday: {
                start: String,
                end: String
            },

            sunday: {
                start: String,
                end: String
            }
        }
    },
    {
        timestamps: true
    }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;