import React, { useState, useEffect } from 'react';
import { bookingAPI, rideAPI, userAPI } from '../api/api';
import '../styles/BookingManagement.css';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [rides, setRides] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    ride: { id: '' },
    passenger: { id: '' },
    seatsBooked: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchRides();
    fetchUsers();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAll();
      setBookings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRides = async () => {
    try {
      const response = await rideAPI.getAll();
      setRides(response.data);
    } catch (err) {
      console.error('Failed to fetch rides', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rideId') {
      setFormData((prev) => ({
        ...prev,
        ride: { id: value },
      }));
    } else if (name === 'passengerId') {
      setFormData((prev) => ({
        ...prev,
        passenger: { id: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ride: { id: Number(formData.ride.id) },
        passenger: { id: Number(formData.passenger.id) },
        seatsBooked: Number(formData.seatsBooked)
      };
      if (editingId) {
        await bookingAPI.update(editingId, payload);
        setError('');
        setEditingId(null);
      } else {
        await bookingAPI.create(payload);
        setError('');
      }
      resetForm();
      fetchBookings();
    } catch (err) {
      setError(editingId ? 'Failed to update booking' : 'Failed to create booking');
      console.error(err);
    }
  };

  const handleEdit = (booking) => {
    setFormData({
      ride: { id: booking.ride?.id || '' },
      passenger: { id: booking.passenger?.id || '' },
      seatsBooked: booking.seatsBooked,
    });
    setEditingId(booking.id);
    setError('');
  };

  const handleConfirm = async (id) => {
    try {
      await bookingAPI.confirm(id);
      setError('');
      fetchBookings();
    } catch (err) {
      setError('Failed to confirm booking');
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancel(id);
        setError('');
        fetchBookings();
      } catch (err) {
        setError('Failed to cancel booking');
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    const enteredPassword = window.prompt('Enter password to delete this booking:');

    if (enteredPassword === null) return;

    const normalizedPassword = enteredPassword.trim();
    if (!normalizedPassword) {
      alert('Password is required. Delete action denied.');
      return;
    }

    if (normalizedPassword !== 'admin123') {
      alert('Incorrect password. Delete action denied.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      await bookingAPI.delete(id);
      setError('');
      fetchBookings();
    } catch (err) {
      setError('Failed to delete booking');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      ride: { id: '' },
      passenger: { id: '' },
      seatsBooked: '',
    });
    setEditingId(null);
  };

  return (
    <div className="booking-management">
      <h2>Booking Management</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="form-section">
        <h3>{editingId ? 'Edit Booking' : 'Create New Booking'}</h3>
        <form onSubmit={handleSubmit}>
          <select
            name="rideId"
            value={formData.ride.id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Ride</option>
            {rides.map((ride) => (
              <option key={ride.id} value={ride.id}>
                {ride.startingLocation} → {ride.destination} ({ride.availableSeats} seats)
              </option>
            ))}
          </select>
          <select
            name="passengerId"
            value={formData.passenger.id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Passenger</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="seatsBooked"
            placeholder="Seats to Book"
            value={formData.seatsBooked}
            onChange={handleInputChange}
            required
          />
          <button type="submit">{editingId ? 'Update Booking' : 'Create Booking'}</button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="bookings-list">
        <h3>Bookings List</h3>
        {loading ? (
          <p>Loading...</p>
        ) : bookings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Driver</th>
                <th>Ride</th>
                <th>Seats</th>
                <th>Booking Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.passenger.name}</td>
                  <td>
                    {booking.ride.startingLocation} → {booking.ride.destination}
                  </td>
                  <td>{booking.seatsBooked}</td>
                  <td>{new Date(booking.bookingDate).toLocaleString()}</td>
                  <td>{booking.status}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(booking)}
                    >
                      Edit
                    </button>
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          className="confirm-btn"
                          onClick={() => handleConfirm(booking.id)}
                        >
                          Confirm
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(booking.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No bookings found</p>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
