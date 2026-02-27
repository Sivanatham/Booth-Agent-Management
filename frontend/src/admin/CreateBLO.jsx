// src/admin/CreateBLO.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";
import "./CreateBLO.css";

function CreateBLO() {
  const navigate = useNavigate();

  const [blo, setBlo] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    region: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create BLO (Agent)
  const createBlo = async () => {
  if (!blo.name || !blo.phone || !blo.email || !blo.password || !blo.region) {
    alert("Please fill all fields");
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Session expired. Please login again.");
      navigate("/");
      return;
    }

    await axios.post(
      'http://127.0.0.1:8000/users/agents', 
      blo,
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }
    );


    alert("Agent Created Successfully ✅");

  } catch (error) {
    console.error(error);
    alert(error.response?.data?.detail || "Error creating agent");
  }
};

  return (
    <div className="create-blo">
      <NavBar />

      <div className="create-content">
        <h3>Create BDA</h3>

        <input
          className="input-field"
          name="name"
          placeholder="Name"
          value={blo.name}
          onChange={handleChange}
        />

        <input
          className="input-field"
          name="phone"
          placeholder="Phone Number"
          value={blo.phone}
          onChange={handleChange}
        />

        <input
          className="input-field"
          name="email"
          placeholder="Email"
          value={blo.email}
          onChange={handleChange}
        />

        <input
          className="input-field"
          type="password"
          name="password"
          placeholder="Password"
          value={blo.password}
          onChange={handleChange}
        />

        <select
          className="input-field"
          name="region"
          value={blo.region}
          onChange={handleChange}
        >
          <option value="">Select Region</option>
          <option value="east">East</option>
          <option value="west">West</option>
          <option value="north">North</option>
          <option value="south">South</option>
        </select>

        <button className="primary-button" onClick={createBlo}>
          Create
        </button>
      </div>
    </div>
  );
}

export default CreateBLO;
