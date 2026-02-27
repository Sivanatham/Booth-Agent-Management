import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import ChangePasswordModal from './ChangePasswordModal';
import Toast from './Toast';
import api from '../api/axios';
import './Dashboard.css';

const initialMemberState = {
  name: '',
  age: '',
  gender: 'Male',
  voterId: '',
  party: 'A',
  feedback: '',
};

export default function Dashboard() {
  // Form State (Untouched as requested)
  const [doorNumber, setDoorNumber] = useState('');
  const [member, setMember] = useState({ ...initialMemberState });
  const [members, setMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [agentStats, setAgentStats] = useState({
    total_houses_collected: 0,
    total_members_collected: 0,
    adult_members: 0,
    minor_members: 0,
    agent_region: '-',
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Layout State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ---------- Form Helpers (Preserved logic) ---------- */
  const handleMemberChange = (field, value) => {
    setMember((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateMember = () => {
    const e = {};
    if (!member.name.trim()) e.name = 'Name is required';
    if (!member.age || Number(member.age) <= 0) e.age = 'Valid age is required';
    if (!member.voterId.trim()) e.voterId = 'Voter ID is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addMember = () => {
    if (!validateMember()) return;

    if (editingId) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editingId ? { ...member, id: editingId } : m))
      );
      setEditingId(null);
    } else {
      const newMember = { ...member, id: Date.now() };
      setMembers((prev) => [...prev, newMember]);
    }

    setMember({ ...initialMemberState });
    setErrors({});
    setSuccessMsg('');
  };

  const editMember = (m) => {
    setMember({ ...m });
    setEditingId(m.id);
    setErrors({});
  };

  const cancelEdit = () => {
    setMember({ ...initialMemberState });
    setEditingId(null);
    setErrors({});
  };

  const deleteMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const loadAgentStats = async () => {
    setStatsLoading(true);
    try {
      const { data } = await api.get('/agent/dashboard');
      setAgentStats(data);
    } catch (error) {
      console.error('Failed to load agent dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadAgentStats();
  }, []);

  const submitAll = async () => {
    if (!doorNumber.trim()) {
      setErrors({ doorNumber: 'Door Number is required' });
      return;
    }
    if (members.length === 0) {
      setErrors({ submit: 'Add at least one member before submitting' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/agent/booth', {
        door_number: doorNumber,
        members: members.map(m => ({
          name: m.name,
          age: parseInt(m.age, 10),
          gender: m.gender,
          party: m.party,
          feedback: m.feedback
        }))
      });

      setSuccessMsg('Household data submitted successfully!');
      setToastMessage('Household data submitted successfully!');
      setDoorNumber('');
      setMembers([]);
      await loadAgentStats();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Submission failed';
      setErrors({ submit: message });
      setToastMessage('Error: ' + message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Sidebar Actions ---------- */
  const handlePasswordSubmit = (message) => {
    setIsPasswordModalOpen(false);
    setToastMessage(message || 'Password Changed Successfully');
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isSidebarOpen ? 'visible-overlay' : 'hidden-overlay'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Navigation */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar
          onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="main-content">

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="mobile-header">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mobile-menu-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="mobile-header-branding">
            <div className="mobile-header-icon">B</div>
            <span className="mobile-header-title">BLO Portal</span>
          </div>
          <div className="mobile-header-spacer"></div>
        </div>

        <div className="form-workspace">
          <div className="form-card">

            {/* Header */}
            <div className="form-header">
              <h1>BLO Household Data Collection</h1>
              <p>Efficiently manage household registrations for your region.</p>
            </div>

            <section className="agent-stats-grid">
              <div className="agent-stat-card">
                <span className="agent-stat-label">Region</span>
                <span className="agent-stat-value">{statsLoading ? '...' : agentStats.agent_region}</span>
              </div>
              <div className="agent-stat-card">
                <span className="agent-stat-label">Total Houses</span>
                <span className="agent-stat-value">{statsLoading ? '...' : agentStats.total_houses_collected}</span>
              </div>
              <div className="agent-stat-card">
                <span className="agent-stat-label">Total Members</span>
                <span className="agent-stat-value">{statsLoading ? '...' : agentStats.total_members_collected}</span>
              </div>
              <div className="agent-stat-card">
                <span className="agent-stat-label">Adults / Minors</span>
                <span className="agent-stat-value">
                  {statsLoading ? '...' : `${agentStats.adult_members} / ${agentStats.minor_members}`}
                </span>
              </div>
            </section>

            <div className="form-section">
              {/* Door Number */}
              <div className="door-container">
                <label className="input-label">🚪 Door Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 12A, 305-B"
                  value={doorNumber}
                  onChange={(e) => setDoorNumber(e.target.value)}
                  className={`form-input ${errors.doorNumber ? 'error' : ''}`}
                />
                {errors.doorNumber && <p className="error-msg">{errors.doorNumber}</p>}
              </div>

              {/* Add New Member Document */}
              <fieldset className="member-fieldset">
                <legend className="fieldset-legend">
                  <div className="legend-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {editingId ? 'Edit Member Details' : 'Add New Member'}
                </legend>

                <div className="member-fields-wrapper">
                  {/* Full Name */}
                  <div className="full-width-field">
                    <label className="input-label">Full Name *</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange('name', e.target.value)}
                      className={`form-input ${errors.name ? 'error' : ''}`}
                    />
                    {errors.name && <p className="error-msg">{errors.name}</p>}
                  </div>

                  <div className="grid-row-split">
                    {/* Age */}
                    <div>
                      <label className="input-label">Age *</label>
                      <input
                        type="number"
                        min="18"
                        max="120"
                        value={member.age}
                        onChange={(e) => handleMemberChange('age', e.target.value)}
                        className={`form-input ${errors.age ? 'error' : ''}`}
                      />
                      {errors.age && <p className="error-msg">{errors.age}</p>}
                    </div>

                    {/* Gender */}
                    <div>
                      <span className="input-label">Gender</span>
                      <div className="radio-group">
                        {['Male', 'Female', 'Other'].map((g) => (
                          <label key={g} className="radio-label">
                            <input
                              type="radio"
                              checked={member.gender === g}
                              onChange={() => handleMemberChange('gender', g)}
                              className="radio-input"
                            /> {g}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Voter ID */}
                  <div className="full-width-field">
                    <label className="input-label">Voter ID *</label>
                    <input
                      type="text"
                      placeholder="ABC1234567"
                      value={member.voterId}
                      onChange={(e) => handleMemberChange('voterId', e.target.value)}
                      className={`form-input ${errors.voterId ? 'error' : ''}`}
                    />
                    {errors.voterId && <p className="error-msg">{errors.voterId}</p>}
                  </div>

                  {/* Political Ref / Party */}
                  <div className="full-width-field">
                    <span className="input-label">Political Ref / Party</span>
                    <div className="party-group">
                      {['A', 'B', 'C', 'D', 'Other'].map((p) => (
                        <label
                          key={p}
                          className={`party-btn ${member.party === p ? 'active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="party"
                            value={p}
                            checked={member.party === p}
                            onChange={() => handleMemberChange('party', p)}
                          />
                          {p}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="full-width-field">
                    <label className="input-label">Additional Remarks</label>
                    <textarea
                      rows="3"
                      placeholder="Enter any relevant observations..."
                      value={member.feedback}
                      onChange={(e) => handleMemberChange('feedback', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </fieldset>

              <div className="action-buttons-group">
                <div className="action-buttons-wrapper">
                  <button
                    onClick={addMember}
                    className="btn-primary"
                  >
                    {editingId ? 'Update Member' : 'Add Member to Household'}
                  </button>
                  {editingId && (
                    <button
                      onClick={cancelEdit}
                      className="btn-secondary"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              {members.length > 0 && (
                <>
                  <hr className="divider" />

                  <div className="summary-section">
                    <div className="summary-header">
                      <span>Household Summary</span>
                      <span className="summary-badge">{members.length} Members</span>
                    </div>

                    <div className="summary-list">
                      {members.map((m) => (
                        <div key={m.id} className="summary-card">
                          <div className="summary-info">
                            <h3 className="summary-name">{m.name}</h3>
                            <div className="summary-details">
                              <span className="summary-detail-item">Age: {m.age}</span>
                              <span className="summary-detail-item">•</span>
                              <span className="summary-detail-item">ID: {m.voterId}</span>
                              <span className="summary-detail-item">•</span>
                              <span className="summary-detail-item party">Party {m.party}</span>
                            </div>
                          </div>

                          <div className="summary-actions">
                            <button
                              onClick={() => editMember(m)}
                              className="icon-btn edit"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteMember(m.id)}
                              className="icon-btn delete"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {successMsg && (
                <div className="success-message">
                  {successMsg}
                </div>
              )}

              <div className="final-submit-wrapper">
                <button
                  onClick={submitAll}
                  disabled={submitting || members.length === 0}
                  className="btn-final"
                >
                  {submitting ? 'Submitting Registry...' : 'Finalize Household Submission'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {isPasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmitSuccess={handlePasswordSubmit}
        />
      )}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />
    </div>
  );
}
