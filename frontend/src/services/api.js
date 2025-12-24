import axios from "axios";

// 1. Base URL for your Spring Boot Backend
// Change '/api/auth' to whatever your Controller RequestMapping is.
const API_URL = "http://localhost:8081/api/auth";
const BUSINESS_API = "http://localhost:8081/api/business";
const INVOICE_API = "http://localhost:8081/api/invoices";
const GODOWN_API = "http://localhost:8081/api/godowns";
const PRODUCT_API = "http://localhost:8081/api/products";
const CUSTOMER_API = "http://localhost:8081/api/customers";

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
    "Content-Type": "application/json"
  },
});

const godownClient = axios.create({
  baseURL: GODOWN_API,
  headers: {
    "Content-Type": "application/json"
  },
});

const productClient = axios.create({
  baseURL: PRODUCT_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

const customerClient = axios.create({
  baseURL: CUSTOMER_API,
  headers: {
    'Content-Type': 'application/json',
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

// Delete invoice
export const deleteInvoice = async (invoiceId) => {
  try {
    const response = await invoiceClient.delete(`/delete/${invoiceId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update invoice
export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    const response = await invoiceClient.put(`/update/${invoiceId}`, invoiceData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// get invoice items 
export const getInvoiceItems = async (invoiceId) => {
  try {
    const response = await invoiceClient.get(`/${invoiceId}/items`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update individual invoice item
export const updateInvoiceItem = async (invoiceId, id, itemData) => {
  try {
    const response = await invoiceClient.put(`/${invoiceId}/items/${id}`, itemData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete individual invoice item
export const deleteInvoiceItem = async (invoiceId, id) => {
  try {
    const response = await invoiceClient.delete(`/${invoiceId}/items/${id}`);
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
  console.log("Response data:", response.data);
  console.log("UserBusinessId from response:", response.data?.userBusinessId || response.data?.id || "NOT FOUND");
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

// =========================================
// GODOWN API FUNCTIONS
// =========================================

// Create Godown
export const createGodown = async (godownData) => {
  try {
    const response = await godownClient.post("/create", godownData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get All Godowns
export const getGodowns = async (userBusinessId) => {
  try {
    console.log("Fetching godowns for businessId:", userBusinessId);
    const response = await godownClient.get(`list/${userBusinessId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get Godown by ID
export const getGodownById = async (godownId) => {
  try {
    const response = await godownClient.get(`/${godownId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete Godown
export const deleteGodown = async (godownId) => {
  try {
    const response = await godownClient.delete(`/delete/${godownId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update Godown
export const updateGodown = async (godownId, godownData) => {
  try {
    const response = await godownClient.put(`/update/${godownId}`, godownData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// =========================================
// PRODUCT API FUNCTIONS
// =========================================

// Product API client


// Create Product
export const createProduct = async (productData) => {
  try {
    console.log("Creating product with data:", productData);
    const response = await productClient.post("/createProduct", productData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get All Products by Godown ID
export const getProductsByGodown = async (godownId) => {
  try {
    const response = await productClient.get(`/godown/${godownId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get All Products (for sales invoice dropdown)
export const getAllProducts = async () => {
  try {
    const response = await productClient.get(""); // Empty path matches @GetMapping in backend
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get Product by ID
export const getProductById = async (productId) => {
  try {
    const response = await productClient.get(`/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update Product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await productClient.put(`/update/${productId}`, productData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete Product
export const deleteProduct = async (productId) => {
  try {
    const response = await productClient.delete(`/delete/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Download Godown Report as PDF
export const downloadGodownReport = async (userBusinessId) => {
  try {
    const response = await godownClient.get(`/report/pdf/${userBusinessId}`, {
      responseType: 'blob'  // Important for file download
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// =========================================
// CUSTOMER API FUNCTIONS
// =========================================

// Create Customer
export const createCustomer = async (customerData) => {
  try {
    console.log("Creating customer with data:", customerData);
    const response = await customerClient.post("/create", customerData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get All Customers
export const getAllCustomers = async () => {
  try {
    const response = await customerClient.get("/getAll");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get Customers by Business ID
export const getCustomersByBusinessId = async (businessId) => {
  try {
    const response = await customerClient.get(`/business/${businessId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get Customer by ID
export const getCustomerById = async (customerId) => {
  try {
    const response = await customerClient.get(`/${customerId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update Customer
export const updateCustomer = async (customerId, customerData) => {
  try {
    const response = await customerClient.put(`/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete Customer
export const deleteCustomer = async (customerId) => {
  try {
    const response = await customerClient.delete(`/${customerId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};


