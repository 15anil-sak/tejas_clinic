const Appointment = require('../models/Appointment');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getAll();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.getById(req.params.id);
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Public (handles patient creation)
const createAppointment = async (req, res) => {
    // Log incoming data for debugging
    console.log('1. RECEIVED BOOKING DATA:', req.body); 

    const { 
        service, // Note: This is the service NAME from the form
        appointment_date, 
        description,
        patient_name,
        mobile_number,
        patient_email
    } = req.body;

    // Validate essential fields from the form
    if (!service || !appointment_date || !patient_name || !mobile_number || !patient_email) {
        return res.status(400).json({ message: 'Please include all required fields.' });
    }

    try {
        const db = require('../config/db');
        let service_id;
        let patient_id;

        // Step 1: Look Up Service ID
        const [services] = await db.execute('SELECT id FROM services WHERE name = ?', [service]);
        if (services.length === 0) {
            return res.status(404).json({ message: `Service '${service}' not found.` });
        }
        service_id = services[0].id;

        // Step 2: Handle Patient ID (Upsert Logic)
        let user = await User.findByEmail(patient_email);

        if (user) {
            // If user exists, use their ID
            patient_id = user.id;
        } else {
            // If user does not exist, create them
            const newUserSql = 'INSERT INTO users (name, email, mobile_number, role) VALUES (?, ?, ?, ?)';
            const [result] = await db.execute(newUserSql, [patient_name, patient_email, mobile_number, 'patient']);
            patient_id = result.insertId;
        }

        // Step 3: Insert Appointment
        const appointment = new Appointment(
            patient_id, 
            service_id, 
            appointment_date, 
            description || null,
            patient_name,      // These are now for the appointment record itself
            mobile_number,
            patient_email,
            undefined // Use default status
        );
        
        const newAppointment = await appointment.save();
        
        // Fetch the full appointment details to return to the client
        const createdAppointment = await Appointment.getById(newAppointment.id);

        console.log('3. BOOKING SUCCESS:', createdAppointment);
        res.status(201).json(createdAppointment);

    } catch (error) {
        // Log the specific MySQL error message
        console.error('2. DATABASE INSERTION ERROR:', error.message); 
        console.error(error); // Full error stack
        res.status(500).json({ message: 'Server error booking appointment.' });
    }
};

// @desc    Update an appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  const { status } = req.body;

  try {
    await Appointment.update(req.params.id, status);
    res.json({ message: 'Appointment updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    await Appointment.delete(req.params.id);
    res.json({ message: 'Appointment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
