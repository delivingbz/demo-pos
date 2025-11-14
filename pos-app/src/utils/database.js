import axios from "axios";

const checkDatabaseConnection = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/status");
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
    const response = await axios.post(
      "http://localhost:5000/api/receipts",
      receipt,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving receipt:", error);
    throw error;
  }
};

export { checkDatabaseConnection, saveReceipt };
