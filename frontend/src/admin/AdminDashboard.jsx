import { useEffect, useRef, useState } from "react";
import NavBar from "./NavBar";
import api from "../api/axios";
import "./AdminDashboard.css";

const getPartyColor = (index) => {
  const colors = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#fd7e14", "#20c997"];
  return colors[index % colors.length];
};

const drawBarChart = (canvas, data) => {
  const ctx = canvas.getContext("2d");
  const entries = data;
  const maxValue = Math.max(...entries.map((e) => e.reports), 1);

  const padding = 40;
  const chartHeight = canvas.height - padding * 2;
  const barWidth = 50;
  const barSpacing = 40;
  const totalBarsWidth = entries.length * barWidth + (entries.length - 1) * barSpacing;
  const startX = (canvas.width - totalBarsWidth) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#2c3e50";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  entries.forEach((blo, idx) => {
    const barHeight = (blo.reports / maxValue) * chartHeight;
    const x = startX + idx * (barWidth + barSpacing);
    const y = canvas.height - padding - barHeight;

    ctx.fillStyle = "#007bff";
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(blo.reports, x + barWidth / 2, y - 5);
  });
};

const drawPieChart = (canvas, data) => {
  const ctx = canvas.getContext("2d");
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, val]) => sum + val, 0);

  if (total === 0) return;

  const size = Math.min(canvas.width, canvas.height);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = size / 2 - 20;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let currentAngle = -Math.PI / 2;
  entries.forEach(([party, supporters], idx) => {
    const sliceAngle = (supporters / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = getPartyColor(idx);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    currentAngle += sliceAngle;
  });
};

const formatDateTime = (value) => {
  if (!value) return "No reports yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No reports yet";
  return date.toLocaleString();
};

function AdminDashboard() {
  const pieCanvasRef = useRef(null);
  const barCanvasRef = useRef(null);

  const [dashboard, setDashboard] = useState({
    total_bda_reports: 0,
    total_agents: 0,
    voter_lists_completed: 0,
    avg_reports_per_bda: 0,
    completion_percentage: 0,
    last_report_time: null,
    region_breakdown: {},
    party_support: {},
    blo_performance: [],
    recent_activities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/users/dashboard");
        setDashboard(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    if (pieCanvasRef.current && Object.keys(dashboard.party_support).length > 0) {
      const canvas = pieCanvasRef.current;
      const container = canvas.parentElement;
      const size = Math.min(container.offsetWidth, 400);
      canvas.width = size;
      canvas.height = size;
      drawPieChart(canvas, dashboard.party_support);

      const handleResize = () => {
        const newSize = Math.min(container.offsetWidth, 400);
        canvas.width = newSize;
        canvas.height = newSize;
        drawPieChart(canvas, dashboard.party_support);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [dashboard.party_support]);

  useEffect(() => {
    if (barCanvasRef.current && dashboard.blo_performance.length > 0) {
      const canvas = barCanvasRef.current;
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = 300;
      drawBarChart(canvas, dashboard.blo_performance);

      const handleResize = () => {
        canvas.width = container.offsetWidth;
        canvas.height = 300;
        drawBarChart(canvas, dashboard.blo_performance);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [dashboard.blo_performance]);

  return (
    <div className="admin-dashboard">
      <NavBar />
      <main className="dashboard-content">
        <h2 className="page-title">Admin Dashboard</h2>

        {loading && <p>Loading dashboard...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <h4>Total BDA Reports</h4>
                <p>{dashboard.total_bda_reports}</p>
                <div className="stat-meta">
                  <span>Avg: {dashboard.avg_reports_per_bda} per BDA</span>
                  <span className="stat-time">Last: {formatDateTime(dashboard.last_report_time)}</span>
                </div>
              </div>

              <div className="stat-card">
                <h4>Voter Lists Completed</h4>
                <p>{dashboard.voter_lists_completed}/{dashboard.total_agents}</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${dashboard.completion_percentage}%` }}></div>
                </div>
                <span className="stat-percentage">{dashboard.completion_percentage}% Complete</span>
                <div className="region-breakdown">
                  {Object.entries(dashboard.region_breakdown).map(([region, data]) => (
                    <div key={region} className="region-item">
                      <span className="region-name">{region}:</span>
                      <span className="region-value">{data.completed}/{data.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stat-card">
                <h4>Recent Activities</h4>
                {dashboard.recent_activities.length > 0 ? (
                  <ul>
                    {dashboard.recent_activities.map((activity) => (
                      <li key={activity.id}>
                        {activity.user}: {activity.action_type} - {activity.details}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No recent activities</p>
                )}
              </div>
            </section>

            {Object.keys(dashboard.party_support).length > 0 && (
              <section className="chart-section">
                <h3 className="section-title">Party Support Chart</h3>
                <div className="pie-chart-container">
                  <canvas ref={pieCanvasRef} className="pie-canvas"></canvas>
                  <div className="pie-legend">
                    {Object.entries(dashboard.party_support).map(([party, supporters], idx) => (
                      <div key={party} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: getPartyColor(idx) }}></span>
                        <span className="legend-text">{party}: {supporters}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {dashboard.blo_performance.length > 0 && (
              <section className="chart-section">
                <h3 className="section-title">BLO Performance</h3>
                <div className="bar-chart-container">
                  <canvas ref={barCanvasRef} className="bar-canvas"></canvas>
                  <div className="bar-legend">
                    {dashboard.blo_performance.map((blo) => (
                      <div key={blo.name} className="legend-item">
                        <span className="legend-text">{blo.name} ({blo.region})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
