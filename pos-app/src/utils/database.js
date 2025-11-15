import axios from "axios";

// Use Vite env variable when deployed; fall back to localhost for development.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const checkDatabaseConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/status`);
    return response.data;
  } catch (error) {
    console.error("Error checking database status:", error);
    throw error;
  }
};

const saveReceipt = async (receipt) => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post(`${API_BASE}/api/receipts`, receipt, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving receipt:", error);
    throw error;
  }
};

export { checkDatabaseConnection, saveReceipt };
