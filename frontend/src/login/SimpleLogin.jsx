import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimpleLogin.css";

const SimpleLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // ✅ Store token
      localStorage.setItem("token", data.access_token);

      // ✅ Store user
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Stored token:", data.access_token);
      console.log("User role:", data.user.role);

      // ✅ Role-based navigation (IMPORTANT: lowercase)
      const role = data.user.role;

      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "AGENT") {
        navigate("/agent");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="auth-card">

        <aside className="welcome-panel">
          <p className="welcome-tag">Election Survey</p>
          <h2>Welcome Back</h2>
          <p>
            Track participation, monitor responses, and manage survey sessions
            in one place.
          </p>
        </aside>

        <div className="login-box">
          <h1>Election Survey System</h1>
          <p className="subtitle">
            Sign in to create, publish, and review survey results.
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SimpleLogin;