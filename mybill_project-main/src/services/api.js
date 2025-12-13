import axios from "axios";

// 1. Base URL for your Spring Boot Backend
// Change '/api/auth' to whatever your Controller RequestMapping is.
const API_URL = "http://localhost:8081/api/auth";
const BUSINESS_API = "http://localhost:8081/api/business";
const INVOICE_API = "http://localhost:8081/api/invoices";

// 2. Create Axios Instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  },
});

const businessClient = axios.create({
  baseURL: BUSINESS_API,
  headers: {
    "Content-Type": "multipart/form-data"

  },
});

const invoiceClient = axios.create({
  baseURL: INVOICE_API,
  headers: {
    "Content-Type": "multipart/form-data"
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
  const response = await invoiceClient.post("/create", invoiceData);
  return response.data;
};

// Get all invoices
export const getInvoices = async (userId) => {
     console.log("Calling Invoice API with userId:", userId);
  try {
    const response = await invoiceClient.get(`/list/${userId}`); // Your backend endpoint to get all invoices
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// SAVE business settings (multipart)
export const saveBusinessSettings = async (formData) => {
  const token = localStorage.getItem("token"); // JWT saved after login
  if (!token) {
    throw new Error("User not logged in or token missing");
  }
  const response = await businessClient.post(
    "/create",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  console.log("Full Axios response:", response);
  return response.data;

};

// GET business settings by userId
export const getBusinessSettings = async (userId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("User not logged in");
  const response = await businessClient.get(`/user/${userId}`);
  return response.data;
};


export default apiClient;