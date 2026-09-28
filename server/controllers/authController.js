const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const Doctor = require("../models/Doctor");
const registerPatient = async (req, res) => {
    const {
        email,
        password,
        fullName,
        phoneNumber
    } = req.body;

    // Validate required fields
    if (!email || !password || !fullName || !phoneNumber) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields"
        });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email already registered"
        });
    }
    const user = await User.create({
        email,
        password,
        role: "patient"
    });
    const patient = await Patient.create({
        userId: user._id,
        fullName,
        phoneNumber
    });
    const token = jwt.sign(
        { userId: user._id,
            role: user.role
         },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
    res.status(201).json({
        success: true,
        message: "Patient registered successfully",
        token
    });


};
const registerDoctor = async (req, res) => {
    const {
        email,
        password,
        fullName,
        phoneNumber,
        specialization
    } = req.body;

    if (!email || !password || !fullName || !phoneNumber || !specialization) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields"
        });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email already registered"
        });
    }

    const user = await User.create({
        email,
        password,
        role: "doctor"
    });

    const doctor = await Doctor.create({
        userId: user._id,
        fullName,
        phoneNumber,
        specialization
    });

    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.status(201).json({
        success: true,
        message: "Doctor registered successfully",
        token,
        userId: user._id,
        doctorId: doctor._id
    });
};
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }
    const token = jwt.sign(
        { userId: user._id,
            role: user.role
            
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
    return res.status(200).json({
    success: true,
    message: "Login successful",
    token
}); 

};
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get user information"
        });
    }
};

module.exports = {
    registerPatient,
    registerDoctor,
    loginUser,
    getMe
};