import api from "../api/api";

const handleLogin = async () => {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    const token = res.data.access_token;

    // Store token
    localStorage.setItem("token", token);

    console.log("Login success");
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};