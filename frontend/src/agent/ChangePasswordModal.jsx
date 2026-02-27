import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ onClose, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (apiError) setApiError('');
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.oldPassword) newErrors.oldPassword = 'Old password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError('');
    try {
      const { data } = await api.patch('/agent/password', {
        old_password: formData.oldPassword,
        new_password: formData.newPassword,
      });
      onSubmitSuccess(data?.message || 'Password changed successfully');
    } catch (error) {
      setApiError(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-modal">
      <div className="cp-modal-overlay" onClick={onClose}></div>

      <div className="cp-modal-content">
        <div className="cp-modal-header">
          <h2 className="cp-modal-title">Change Password</h2>
          <button onClick={onClose} className="cp-close-btn" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="cp-close-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cp-form">
          <div className="cp-field">
            <label className="cp-label">Old Password</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className={`cp-input ${errors.oldPassword ? 'cp-input-error' : ''}`}
              placeholder="••••••••"
            />
            {errors.oldPassword && <p className="cp-error-text">{errors.oldPassword}</p>}
          </div>

          <div className="cp-field">
            <label className="cp-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`cp-input ${errors.newPassword ? 'cp-input-error' : ''}`}
              placeholder="••••••••"
            />
            {errors.newPassword && <p className="cp-error-text">{errors.newPassword}</p>}
          </div>

          <div className="cp-field">
            <label className="cp-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`cp-input ${errors.confirmPassword ? 'cp-input-error' : ''}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="cp-error-text">{errors.confirmPassword}</p>}
          </div>

          {apiError && <p className="cp-api-error">{apiError}</p>}

          <div className="cp-actions">
            <button type="submit" disabled={submitting} className="cp-submit-btn">
              {submitting ? 'Updating...' : 'Submit Change'}
            </button>
            <button type="button" onClick={onClose} className="cp-cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
