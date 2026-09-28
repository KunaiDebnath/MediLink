const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
};

const createAppointment = async (req, res) => {
    try{

    

    const {
        doctorId,
        appointmentDate,
        timeSlot,
        reasonForVisit
    } = req.body;
    if (!doctorId || !appointmentDate || !timeSlot || !reasonForVisit || reasonForVisit.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields"
        });
    }


    const patient = await Patient.findOne({
        userId: req.user.userId
    });

    if (!patient) {
        return res.status(404).json({
            success: false,
            message: "Patient profile not found"
        });
    }
    if (!(mongoose.Types.ObjectId.isValid(doctorId))) {
        return res.status(400).json({
            success: false,
            message: "Invalid doctor ID"


        });


    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor not found"
        });
    }
    if (!(/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate))) {
        return res.status(400).json({
            success: false,
            message: "Invalid date format. Use YYYY-MM-DD"
        })

    }

    const selectedDate = new Date(appointmentDate);
    if (isNaN(selectedDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: "Invalid appointment date"
        });
    }
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return res.status(400).json({
            success: false,
            message: "Cannot book an appointment for a past date"
        });
    }

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

    if (!availability || !availability.start || !availability.end) {
        return res.status(400).json({
            success: false,
            message: "Doctor is not available on this day"
        });
    }

    const startMinutes = timeToMinutes(availability.start);
    const endMinutes = timeToMinutes(availability.end);
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(timeSlot)) {
        return res.status(400).json({
            success: false,
            message: "Invalid time slot format. Use HH:MM"
        });
    }
    const requestedMinutes = timeToMinutes(timeSlot);
    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    if (
        selectedDate.getTime() === today.getTime() &&
        requestedMinutes <= currentMinutes
    ) {
        return res.status(400).json({
            success: false,
            message: "Cannot book an appointment for a past time"
        });
    }

    if (requestedMinutes % 30 !== 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid time slot. Please select a 30-minute slot."
        });
    }

    if (
        requestedMinutes < startMinutes ||
        requestedMinutes >= endMinutes
    ) {
        return res.status(400).json({
            success: false,
            message: "Selected time slot is outside doctor's availability"
        });
    }
    let appointment;
    try {
        appointment = await Appointment.create({
            patientId: patient._id,
            doctorId,
            appointmentDate,
            timeSlot,
            reasonForVisit
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create appointment"
        });
    }



    res.status(201).json({
        success: true,
        message: "Appointment created successfully",
        day: dayName,
        availability,
        timeSlot,
        appointment
    });
}
catch (error) {
    return res.status(500).json({
        success: false,
        message: "Failed to create appointment"
    });
}
};


const getAppointments = async (req, res) => {
    try {
        const patient = await Patient.findOne({
            userId: req.user.userId
        });
    


    if (!patient) {
        return res.status(404).json({
            success: false,
            message: "Patient not found"
        });
    }
    const appointments = await Appointment.find({
        patientId: patient._id
    }).populate("doctorId");

    res.status(200).json({
        success: true,
        appointments
    })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get appointments"
        });
    }

};
const cancelAppointment = async (req, res) => {
    try{

    
    const patient = await Patient.findOne({
        userId: req.user.userId
    });
    if (!patient) {
        return res.status(404).json({
            success: false,
            message: "Patient profile not found"
        });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid appointment ID"
        });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: "Appointment not found"
        })
    }

    if (appointment.patientId.toString() !== patient._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to cancel this appointment"
        });
    }
    if (
        appointment.status === "Cancelled" ||
        appointment.status === "Completed" ||
        appointment.status === "Rejected"
    ) {
        return res.status(400).json({
            success: false,
            message: "Appointment cannot be cancelled"
        });
    }
    appointment.status = "Cancelled";
    await appointment.save();
    res.status(200).json({
        success: true,
        message: "Appointment cancelled successfully",
        appointment
    });
}
catch (error) {
    return res.status(500).json({
        success: false,
        message: "Failed to cancel appointment"
    });
}
}
const getDoctorAppointments = async (req, res) => {
    try{

    
    const doctor = await Doctor.findOne({
        userId: req.user.userId
    });
    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor Profile not found"
        })
    }
    const appointments = await Appointment.find({
        doctorId: doctor._id
    }).populate("patientId");

    if (appointments.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No appointments found"
        });
    }
    res.status(200).json({
        success: true,
        appointments
    });
}
catch (error) {
    return res.status(500).json({
        success: false,
        message: "Failed to get doctor appointment"
    });
}



};
const confirmAppointment = async (req, res) => {
    try{

    
    const doctor = await Doctor.findOne({
        userId: req.user.userId
    });
    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor Profile not found"
        })
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid appointment ID"
        });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: "Appointment not found"
        })
    }
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to confirm this appointment"
        });
    }
    if (appointment.status !== "Pending") {
        return res.status(400).json({
            success: false,
            message: "Only pending appointments can be confirmed"
        });
    }

    appointment.status = "Confirmed";
    await appointment.save();

    res.status(200).json({
        success: true,
        message: "Appointment confirmed successfully",
        appointment
    });
}catch (error) {
    return res.status(500).json({
        success: false,
        message: "Failed to confirm appointment"
    });
}


};
const rejectAppointment = async (req, res) => {
    try{

    
    const doctor = await Doctor.findOne({
        userId: req.user.userId
    });
    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor Profile not found"
        })
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid appointment ID"
        });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: "Appointment not found"
        })
    }
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to Reject this appointment"
        });
    }
    if (appointment.status !== "Pending") {
        return res.status(400).json({
            success: false,
            message: "Only pending appointments can be rejected"
        });
    }
    appointment.status = "Rejected";
    await appointment.save();

    res.status(200).json({
        success: true,
        message: "Appointment rejected successfully",
        appointment
    });
}catch (error) {
    return res.status(500).json({
        success: false,
        message: "Failed to reject appointment"
    });
}

};
const completeAppointment = async (req, res) => {
    try{

    
    const doctor = await Doctor.findOne({
        userId: req.user.userId
    });
    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: "Doctor Profile not found"
        })
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid appointment ID"
        });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: "Appointment not found"
        })
    }
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "You are not allowed to Complete this appointment"
        });
    }
    if (appointment.status !== "Confirmed") {
        return res.status(400).json({
            success: false,
            message: "Only confirmed appointments can be completed"
        });
    }
    appointment.status = "Completed";
    await appointment.save();

    res.status(200).json({
        success: true,
        message: "Appointment Completed successfully",
        appointment
    });
}
catch (error) {
    return res.status(500).json({
        success: false,
        message: "Failed to complete appointment"
    });
}




};


module.exports = {
    createAppointment,
    getAppointments,
    cancelAppointment,
    getDoctorAppointments,
    confirmAppointment,
    rejectAppointment,
    completeAppointment
};
