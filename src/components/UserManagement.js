import React, { useState, useEffect } from 'react';
import { userAPI } from '../api/api';
import '../styles/UserManagement.css';

const getApiErrorMessage = (err, fallbackMessage) => {
  const apiError = err?.response?.data?.error || err?.response?.data?.message;
  if (typeof apiError === 'string' && apiError.trim()) {
    return apiError;
  }
  if (err?.message === 'Network Error') {
    return 'Unable to connect to server. Please check backend is running on port 8080.';
  }
  return fallbackMessage;
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      const data = response?.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.users)
        ? data.users
        : [];
      setUsers(list);
      if (!Array.isArray(data) && list.length === 0) {
        console.warn('Unexpected users response shape:', data);
      }
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch users'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (error) {
      setError('');
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await userAPI.update(editingId, formData);
        setError('');
        setEditingId(null);
      } else {
        await userAPI.create(formData);
        setError('');
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(
        getApiErrorMessage(err, editingId ? 'Failed to update user' : 'Failed to create user')
      );
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(id);
        setError('');
        fetchUsers();
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to delete user'));
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setEditingId(null);
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="form-section">
        <h3>{editingId ? 'Edit User' : 'Add New User'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
          <button type="submit">{editingId ? 'Update User' : 'Add User'}</button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="users-list">
        <h3>Users List</h3>
        {loading ? (
          <p>Loading...</p>
        ) : users.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.address}</td>
                  <td>{user.rating}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
