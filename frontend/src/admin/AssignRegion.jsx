import { useEffect, useMemo, useState } from "react";
import NavBar from "./NavBar";
import api from "../api/axios";
import "./AssignRegion.css";

function AssignRegion() {
  const [agents, setAgents] = useState([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState([]);
  const [singleAssignRegion, setSingleAssignRegion] = useState("");
  const [file, setFile] = useState(null);
  const [bulkRegion, setBulkRegion] = useState("");
  const [loading, setLoading] = useState(true);

  const agentByEmail = useMemo(() => {
    const map = new Map();
    agents.forEach((agent) => {
      map.set((agent.email || "").trim().toLowerCase(), agent);
    });
    return map;
  }, [agents]);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users/agents");
      setAgents(data);
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const toggleAgentSelection = (agentId) => {
    setSelectedAgentIds((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const assignSingle = async () => {
    if (selectedAgentIds.length === 0 || !singleAssignRegion) {
      alert("Please fill all fields");
      return;
    }

    try {
      await Promise.all(
        selectedAgentIds.map((agentId) =>
          api.patch(`/users/agents/${agentId}/region`, { region: singleAssignRegion })
        )
      );
      alert(`Region assigned to ${selectedAgentIds.length} agent(s) successfully`);
      setSelectedAgentIds([]);
      setSingleAssignRegion("");
      loadAgents();
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to assign region");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleExcelUpload = () => {
    if (!file) {
      alert("Please select a file");
      return;
    }
    if (!bulkRegion) {
      alert("Please choose a region for bulk upload");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result || "";
      const rows = text.split("\n").slice(1);

      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      for (const row of rows) {
        const [name, email, phone, password] = row.split(",").map((item) => (item || "").trim());
        if (!name || !email || !phone || !password) {
          skippedCount += 1;
          continue;
        }

        try {
          const matchedAgent = agentByEmail.get(email.toLowerCase());

          if (matchedAgent) {
            await api.patch(`/users/agents/${matchedAgent.id}/region`, { region: bulkRegion });
            updatedCount += 1;
          } else {
            await api.post("/users/agents", {
              name,
              email,
              phone,
              password,
              region: bulkRegion,
            });
            createdCount += 1;
          }
        } catch (error) {
          console.error("Bulk upload failed for", email, error);
          skippedCount += 1;
        }
      }

      alert(
        `Bulk upload done. Created: ${createdCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`
      );
      setFile(null);
      setBulkRegion("");
      loadAgents();
    };

    reader.readAsText(file);
  };

  const handleDelete = async (agentId, agentName) => {
    if (!window.confirm(`Are you sure you want to delete ${agentName}?`)) return;

    try {
      await api.delete(`/users/${agentId}`);
      alert(`${agentName} has been deleted`);
      loadAgents();
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to delete agent");
    }
  };

  return (
    <div className="assign-region">
      <NavBar />
      <div className="assign-content">
        <h3>Assign Region to BDA</h3>

        <div className="blo-list-display">
          <h4>Created BDA List</h4>
          {loading ? (
            <p>Loading agents...</p>
          ) : (
            <div className="blo-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Region</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id}>
                      <td>{agent.name}</td>
                      <td>{agent.phone}</td>
                      <td>{agent.email}</td>
                      <td>{agent.region || "Not Assigned"}</td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(agent.id, agent.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="excel-section">
          <h4>Excel Bulk Create + Assign Region</h4>
          <p className="info-text">Upload CSV file format: Name, Email, Phone, Password</p>
          <select
            className="input-field"
            value={bulkRegion}
            onChange={(e) => setBulkRegion(e.target.value)}
          >
            <option value="">Select Region for all uploaded agents</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North">North</option>
            <option value="South">South</option>
          </select>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileChange}
            className="file-input"
          />
          
          {file && <p className="file-name">Selected: {file.name}</p>}
          <button className="primary-button" onClick={handleExcelUpload}>
            Upload & Assign
          </button>
        </div>

        <div className="single-section">
          <h4>Multi Select Assign</h4>
          <div className="blo-table">
            <table>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Region</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={`select-${agent.id}`}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedAgentIds.includes(agent.id)}
                        onChange={() => toggleAgentSelection(agent.id)}
                      />
                    </td>
                    <td>{agent.name}</td>
                    <td>{agent.email}</td>
                    <td>{agent.region || "Not Assigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <select
            className="input-field"
            value={singleAssignRegion}
            onChange={(e) => setSingleAssignRegion(e.target.value)}
          >
            <option value="">Select Region</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North">North</option>
            <option value="South">South</option>
          </select>

          <button className="primary-button" onClick={assignSingle}>Assign</button>
        </div>
      </div>
    </div>
  );
}

export default AssignRegion;
