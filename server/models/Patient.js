const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
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

        dateOfBirth: {
            type: Date
        },

        gender: {
            type: String
        },

        bloodGroup: {
            type: String
        },

        address: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;