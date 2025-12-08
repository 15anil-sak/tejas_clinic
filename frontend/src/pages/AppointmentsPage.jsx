import React, { useState, useEffect } from 'react';
import { createAppointment } from '../services/api';
import Modal from '../components/Modal';
import './AppointmentsPage.css';

const AppointmentsPage = () => {
  const [newlyBookedAppointment, setNewlyBookedAppointment] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const hardcodedServices = [
      { id: 1, name: 'Ortho' },
      { id: 2, name: 'Neuro' },
      { id: 3, name: 'Pediatric' },
      { id: 4, name: 'Geriatric' },
      { id: 5, name: 'Obstetric' },
      { id: 6, name: 'Sports Rehabilitation' },
      { id: 7, name: 'Traction' },
      { id: 8, name: 'Cupping Therapies' },
    ];
    setServices(hardcodedServices);
    if (hardcodedServices.length > 0) {
      setServiceId(hardcodedServices[0].id);
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setPatientName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, []);

  const handleBookingConfirmation = async (e) => {
    e.preventDefault();
    setMessage('');
    setNewlyBookedAppointment(null);

    // No token check as per user request to allow unauthenticated bookings

    if (mobileNumber.length !== 10) {
      setMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      const appointmentData = {
        service_id: parseInt(serviceId, 10),
        appointment_date: `${date} ${time}`,
        description: description,
        patient_name: patientName,
        mobile_number: mobileNumber,
        patient_email: email,
      };

      const { data } = await createAppointment(appointmentData);
      setNewlyBookedAppointment(data);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setMessage(`Booking failed: ${error.response?.data?.message || 'An unexpected error occurred. Please try again.'}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setNewlyBookedAppointment(null);
  };

  return (
    <div className="appointments-page">
      <div className="booking-section">
        <h1>Book Your Appointment</h1>
        <form onSubmit={handleBookingConfirmation} className="appointment-form">
          <div className="form-group">
            <label htmlFor="patientName">Patient Name</label>
            <input
              type="text"
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              type="text"
              id="mobileNumber"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="service">Service</label>
            <select
              id="service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="time">Time</label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description of Issue</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
            ></textarea>
          </div>
          <button type="submit" className="cta-button">Confirm Booking</button>
        </form>
        {message && <p className="booking-message">{message}</p>}
      </div>

      {newlyBookedAppointment && (
        <Modal show={showModal} onClose={closeModal}>
          <h2>Appointment Scheduled</h2>
          <p>
            <strong>Patient:</strong> {newlyBookedAppointment.patient_name}
          </p>
          <p>
            <strong>Time:</strong>{' '}
            {new Date(newlyBookedAppointment.appointment_date).toLocaleString()}
          </p>
          <button onClick={closeModal} className="cta-button">
            OK
          </button>
        </Modal>
      )}
    </div>
  );
};

export default AppointmentsPage;
