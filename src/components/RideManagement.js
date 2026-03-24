import React, { useState, useEffect } from 'react';
import { rideAPI, userAPI } from '../api/api';
import '../styles/RideManagement.css';

const RideManagement = () => {
  const [rides, setRides] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    startingLocation: '',
    destination: '',
    departureTime: '',
    availableSeats: '',
    pricePerSeat: '',
    description: '',
    driver: { id: '' },
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRides();
    fetchUsers();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await rideAPI.getAll();
      setRides(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch rides');
      console.error(err);
    } finally {
      setLoading(false);
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
    if (name === 'driverId') {
      setFormData((prev) => ({
        ...prev,
        driver: { id: value ? Number(value) : '' },
      }));
    } else if (name === 'availableSeats') {
      setFormData((prev) => ({
        ...prev,
        availableSeats: value ? Number(value) : '',
      }));
    } else if (name === 'pricePerSeat') {
      setFormData((prev) => ({
        ...prev,
        pricePerSeat: value ? Number(value) : '',
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
        ...formData,
        availableSeats: Number(formData.availableSeats),
        pricePerSeat: Number(formData.pricePerSeat),
        driver: { id: Number(formData.driver.id) },
        status: formData.status || 'SCHEDULED'
      };
      if (editingId) {
        await rideAPI.update(editingId, payload);
        setError('');
        setEditingId(null);
      } else {
        await rideAPI.create(payload);
        setError('');
      }
      resetForm();
      fetchRides();
    } catch (err) {
      setError(editingId ? 'Failed to update ride' : 'Failed to create ride');
      console.error(err);
    }
  };

  const handleEdit = (ride) => {
    setFormData({
      startingLocation: ride.startingLocation,
      destination: ride.destination,
      departureTime: ride.departureTime ? ride.departureTime.slice(0, 16) : '',
      availableSeats: ride.availableSeats,
      pricePerSeat: ride.pricePerSeat,
      description: ride.description,
      driver: { id: ride.driver.id },
    });
    setEditingId(ride.id);
  };

  const handleDelete = async (id) => {
    const enteredPassword = window.prompt('Enter password to delete this ride:');

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

    if (!window.confirm('Are you sure you want to delete this ride?')) return;

    try {
      await rideAPI.delete(id);
      setError('');
      fetchRides();
    } catch (err) {
      setError('Failed to delete ride');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      startingLocation: '',
      destination: '',
      departureTime: '',
      availableSeats: '',
      pricePerSeat: '',
      description: '',
      driver: { id: '' },
    });
    setEditingId(null);
  };

  return (
    <div className="ride-management">
      <h2>Ride Management</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="form-section">
        <h3>{editingId ? 'Edit Ride' : 'Create New Ride'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="startingLocation"
            placeholder="Starting Location"
            value={formData.startingLocation}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="destination"
            placeholder="Destination"
            value={formData.destination}
            onChange={handleInputChange}
            required
          />
          <input
            type="datetime-local"
            name="departureTime"
            value={formData.departureTime}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="availableSeats"
            placeholder="Available Seats"
            value={formData.availableSeats}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="pricePerSeat"
            placeholder="Price Per Seat"
            value={formData.pricePerSeat}
            onChange={handleInputChange}
            step="0.01"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
          />
          <select
            name="driverId"
            value={formData.driver.id}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Driver</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <button type="submit">{editingId ? 'Update Ride' : 'Create Ride'}</button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="rides-list">
        <h3>Rides List</h3>
        {loading ? (
          <p>Loading...</p>
        ) : rides.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>From</th>
                <th>To</th>
                <th>Departure</th>
                <th>Seats</th>
                <th>Price</th>
                <th>Driver</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride.id}>
                  <td>{ride.id}</td>
                  <td>{ride.startingLocation}</td>
                  <td>{ride.destination}</td>
                  <td>{new Date(ride.departureTime).toLocaleString()}</td>
                  <td>{ride.availableSeats}</td>
                  <td>${ride.pricePerSeat}</td>
                  <td>{ride.driver.name}</td>
                  <td>{ride.status}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(ride)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(ride.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No rides found</p>
        )}
      </div>
    </div>
  );
};

export default RideManagement;
