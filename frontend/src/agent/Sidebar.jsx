import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Sidebar.css';

const Sidebar = ({ onOpenPasswordModal, onClose }) => {
  const [view, setView] = useState('menu');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSidebarData = async () => {
      setLoading(true);
      try {
        const [profileRes, dashboardRes] = await Promise.all([
          api.get('/agent/profile'),
          api.get('/agent/dashboard'),
        ]);
        setProfile(profileRes.data);
        setDashboard(dashboardRes.data);
      } catch (error) {
        console.error('Failed to load agent sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSidebarData();
  }, []);

  const agentName = profile?.name || 'Agent';
  const agentEmail = profile?.email || '-';
  const agentPhone = profile?.phone || '-';
  const agentRegion = profile?.region || dashboard?.agent_region || 'Not Assigned';
  const agentInitials = useMemo(() => {
    const parts = agentName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'AG';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [agentName]);

  const regionMetrics = [
    `Houses: ${dashboard?.total_houses_collected ?? 0}`,
    `Members: ${dashboard?.total_members_collected ?? 0}`,
    `Adults: ${dashboard?.adult_members ?? 0}`,
    `Minors: ${dashboard?.minor_members ?? 0}`,
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <aside className="sidebar-container">
      {/* Sidebar Header / Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">B</div>
          <div className="sidebar-title">
            <h1>BLO Portal</h1>
            <p>Government of India</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button className="mobile-close-btn" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="sidebar-scroll-area">
        {view === 'menu' ? (
          <>
            {/* Profile Section */}
            <div className="profile-section">
              <button
                onClick={() => setView('profile')}
                className="profile-btn"
              >
                <div className="profile-avatar">{agentInitials}</div>
                <div className="profile-info">
                  <h2>{agentName}</h2>
                  <p>View Profile</p>
                </div>
                <svg
                  className="profile-chevron"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            {/* Regions Section */}
            <div className="regions-section">
              <p className="regions-label">Your Jurisdiction</p>
              <div>
                {[agentRegion].map((region) => (
                    <div key={region} className="region-item">
                      <button
                        onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
                        className={`region-btn ${selectedRegion === region ? 'active' : ''}`}
                      >
                        <span>{region}</span>
                        <svg
                          className={`profile-chevron ${selectedRegion === region ? 'open' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>

                      {/* Agents List in Region */}
                      <div className={`region-dropdown ${selectedRegion === region ? 'open' : ''}`}>
                        <div className="agents-list">
                          {loading ? (
                            <div className="agent-item">
                              <div className="agent-item-dot"></div>
                              Loading...
                            </div>
                          ) : (
                            regionMetrics.map((metric) => (
                            <div key={metric} className="agent-item">
                              <div className="agent-item-dot"></div>
                              {metric}
                            </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="profile-view">
            <button className="back-btn" onClick={() => setView('menu')}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Menu
            </button>

            <div className="profile-card">
              <div className="profile-data-grid">
                <div className="profile-data-row">
                  <span className="profile-data-label">Email ID</span>
                  <span className="profile-data-value">{agentEmail}</span>
                </div>
                <div className="profile-data-row">
                  <span className="profile-data-label">Region</span>
                  <span className="profile-data-value accent">{agentRegion}</span>
                </div>
                <div className="profile-data-split">
                 
                  <div className="profile-data-row">
                    <span className="profile-data-label">Phone Number</span>
                    <span className="profile-data-value">{agentPhone}</span>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button onClick={onOpenPasswordModal} className="action-btn action-btn-password">
                  Change Password
                </button>
                <button onClick={handleLogout} className="action-btn action-btn-logout">
                  Logout Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System info */}
      <div className="sidebar-footer">
        <div className="server-status">
          <span className="server-status-label">Server Status</span>
          <span className="status-dot"></span>
        </div>
        <div className="copyright">
          2026 © Official BLO Portal
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
