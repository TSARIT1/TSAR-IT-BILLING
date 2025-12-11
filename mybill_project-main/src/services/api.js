import axios from "axios";

// 1. Base URL for your Spring Boot Backend
// Change '/api/auth' to whatever your Controller RequestMapping is.
const API_URL = "http://localhost:8081/api/auth";

// 2. Create Axios Instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. API Functions
export const registerUser = async (userData) => {
  try {
    // Sends POST request to http://localhost:8081/api/auth/register
    const response = await apiClient.post("/register", userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const loginUser = async (loginData) => {
  try {
    // Sends POST request to http://localhost:8081/api/auth/login
    const response = await apiClient.post("/login", loginData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }

};
// Invoice APIs
export const createInvoice = async (invoiceData) => {
  const response = await apiClient.post("/invoices/create", invoiceData);
  return response.data;
};

// Get all invoices
export const getInvoices = async (userId) => {
     console.log("Calling Invoice API with userId:", userId);
  try {
    const response = await apiClient.get(`/invoices/list/${userId}`); // Your backend endpoint to get all invoices
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export default apiClient;