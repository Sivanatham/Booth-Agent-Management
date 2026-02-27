// NavBar.jsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { useBLO } from "./BLOContext";
import "./NavBar.css";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { admin, changePassword } = useBLO();

  const handlePasswordChange = () => {
    if (!oldPassword || !newPassword) {
      alert("Please fill both fields");
      return;
    }
    const result = changePassword(oldPassword, newPassword);
    alert(result.message);
    if (result.success) {
      setOldPassword("");
      setNewPassword("");
      setShowProfile(false);
    }
  };

  return (
    <>
    <header className="navbar">
      <button className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav className={`nav-links ${isOpen ? 'open' : ''}`}>
        <Link to="/admin" onClick={() => setIsOpen(false)}>Dashboard</Link>
        <Link to="/admin/create-blo" onClick={() => setIsOpen(false)}>Create BDA</Link>
        <Link to="/admin/assign-region" onClick={() => setIsOpen(false)}>Assign Region</Link>
        <Link to="/admin/reports" onClick={() => setIsOpen(false)}>View Reports</Link>
      </nav>
      <div className="profile-control-container">
        <button
          className="admin-profile-btn"
          onClick={() => setShowProfile(!showProfile)}
          aria-label="Admin Profile"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" className="user-avatar-svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </button>
      </div>
    </header>
    <div className={`profile-sidebar ${showProfile ? 'open' : ''}`}>
      <button className="close-sidebar" onClick={() => setShowProfile(false)}>×</button>
      <div className="profile-info">
        <h3>{admin.name}</h3>
        <p>{admin.email}</p>
        <p>Administrator</p>
      </div>
      <div className="password-change">
        <h4>Change Password</h4>
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="profile-input"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="profile-input"
        />
        <button onClick={handlePasswordChange} className="profile-submit">Submit</button>
      </div>
      <Link to="/login" className="logout-btn">Logout</Link>
    </div>
    {showProfile && <div className="sidebar-overlay" onClick={() => setShowProfile(false)}></div>}
    </>
  );
}

export default NavBar;
