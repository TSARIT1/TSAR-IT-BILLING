import axios from "axios";

// 1. Base URL — uses REACT_APP_API_URL env var in production; falls back to localhost for development
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8081";

const API_URL = `${BASE_URL}/api/auth`;
const BUSINESS_API = `${BASE_URL}/api/business`;
const INVOICE_API = `${BASE_URL}/api/invoices`;
const GODOWN_API = `${BASE_URL}/api/godowns`;
const PRODUCT_API = `${BASE_URL}/api/products`;
const CUSTOMER_API = `${BASE_URL}/api/customers`;

// 2. JWT Auth Interceptor Helper
// Attaches Bearer token from localStorage to every request automatically
const addAuthInterceptor = (client) => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  // Handle 401 globally — clear session and redirect to login
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
  return client;
};

// 3. Create Axios Instances (with auth interceptors applied to all protected clients)
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});
// NOTE: apiClient intentionally skips auth interceptor — it handles login/register

const businessClient = addAuthInterceptor(axios.create({
  baseURL: BUSINESS_API,
  headers: { "Content-Type": "multipart/form-data" },
}));

const invoiceClient = addAuthInterceptor(axios.create({
  baseURL: INVOICE_API,
  headers: { "Content-Type": "application/json" },
}));

const godownClient = addAuthInterceptor(axios.create({
  baseURL: GODOWN_API,
  headers: { "Content-Type": "application/json" },
}));

const productClient = addAuthInterceptor(axios.create({
  baseURL: PRODUCT_API,
  headers: { 'Content-Type': 'application/json' },
}));

const customerClient = addAuthInterceptor(axios.create({
  baseURL: CUSTOMER_API,
  headers: { 'Content-Type': 'application/json' },
}));

const SALES_API = `${BASE_URL}/api/sales`;

const salesClient = addAuthInterceptor(axios.create({
  baseURL: SALES_API,
  headers: { 'Content-Type': 'application/json' },
}));


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

export const forgotPassword = async (identifier) => {
  try {
    const response = await apiClient.post("/forgot-password", { identifier });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const resetPassword = async (resetData) => {
  try {
    const response = await apiClient.post("/reset-password", resetData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const changePassword = async (changeData) => {
  try {
    const response = await apiClient.post("/change-password", changeData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await apiClient.get(`/profile/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await apiClient.put(`/profile/${userId}`, profileData);
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
  return invoiceClient.put(`/update/${invoiceId}`, invoiceData);
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

// Confirm Sale from Invoice
export const confirmSaleFromInvoice = async (invoiceId) => {
  try {
    const response = await invoiceClient.post(`/${invoiceId}/confirm-sale`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Confirm Purchase from Invoice (adds stock)
export const confirmPurchase = async (invoiceId) => {
  try {
    const response = await invoiceClient.post(`/${invoiceId}/confirm-purchase`);
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

// GET business details by businessId
export const getBusinessDetails = async (businessId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("User not logged in");
  const response = await businessClient.get(`/${businessId}`);
  return response.data;
};

// GET business settings by userId (Legacy/Broken?)
export const getBusinessSettings = async (userId) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("User not logged in");
  const response = await businessClient.get(`/user/${userId}`);
  return response.data;
};



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
    const response = await godownClient.get(`/list/${userBusinessId}`);
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

// Get Product Stock Summary (for Items Inventory page)
export const getProductStockSummary = async () => {
  try {
    const response = await productClient.get('/stock-summary');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Download Items Inventory Report as PDF
export const downloadInventoryReport = async (businessId) => {
  try {
    const response = await productClient.get(`/report/pdf/${businessId}`, {
      responseType: 'blob'  // Important for file download
    });
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

// Search customers by name / phone / id (ACTIVE only)
export const searchCustomers = async (query) => {
  try {
    const response = await customerClient.get(`/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get customer by unique phone number
export const getCustomerByPhone = async (phone) => {
  try {
    const response = await customerClient.get(`/search`, {
      params: { phone }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Download Parties Report as PDF
export const downloadPartiesReport = async (businessId) => {
  try {
    const response = await customerClient.get(`/report/pdf/${businessId}`, {
      responseType: 'blob'  // Important for file download
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Download Parties Report as CSV
export const downloadPartiesReportCSV = async (businessId) => {
  try {
    const response = await customerClient.get(`/report/csv/${businessId}`, {
      responseType: 'blob'  // Important for file download
    });
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


// ============================================
// SALES API FUNCTIONS
// ============================================

// Get All Sales
export const getSales = async () => {
  try {
    const response = await salesClient.get('');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Create Sale
export const createSale = async (saleData) => {
  try {
    const response = await salesClient.post('/create', saleData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Mark Sale as Paid
export const markSaleAsPaid = async (saleId) => {
  try {
    const response = await salesClient.put(`/${saleId}/mark-paid`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get Sale Items by Sale ID
export const getSaleItems = async (saleId) => {
  try {
    const response = await salesClient.get(`/${saleId}/items`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Download Sales Slip PDF
export const downloadSalesSlip = async (saleId, businessId) => {
  try {
    const response = await salesClient.get(`/${saleId}/slip`, {
      params: { businessId },
      responseType: 'blob'
    });

    // Check if response is actually an error (text/xml or text/html instead of PDF)
    if (response.data.type !== 'application/pdf') {
      const text = await response.data.text();
      console.error('Backend error response:', text);
      throw new Error('Backend returned error: ' + text.substring(0, 200));
    }

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      // Try to read error message from blob
      if (error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        throw new Error(text);
      }
      throw error.response.data;
    }
    throw error;
  }
};

// Purchase Return APIs
const PURCHASE_RETURN_API = `${BASE_URL}/api/purchase-returns`;

const purchaseReturnClient = addAuthInterceptor(axios.create({
  baseURL: PURCHASE_RETURN_API,
  headers: { "Content-Type": "application/json" },
}));

// Create purchase return
export const createPurchaseReturn = async (returnData) => {
  try {
    console.log("API Call - Creating purchase return at:", PURCHASE_RETURN_API);
    console.log("Request data:", returnData);
    const response = await purchaseReturnClient.post('', returnData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// Get all purchase returns
export const getPurchaseReturns = async () => {
  try {
    const response = await purchaseReturnClient.get('');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Mark returns as received
export const markReturnsAsReceived = async (returnIds) => {
  try {
    const response = await purchaseReturnClient.post('/mark-received', { returnIds });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Download Purchase Invoices PDF
export const downloadPurchaseInvoicesPdf = async (businessId, startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await purchaseReturnClient.get(`/report/purchase-invoices/pdf/${businessId}`, {
      responseType: 'blob',  // Important for file download
      params: params
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Download Purchase Returns PDF
export const downloadPurchaseReturnsPdf = async (businessId) => {
  try {
    const response = await purchaseReturnClient.get(`/report/purchase-returns/pdf/${businessId}`, {
      responseType: 'blob'  // Important for file download
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get print data for a purchase return (business + supplier details)
export const getPrintData = async (returnId, businessId) => {
  try {
    const response = await purchaseReturnClient.get(`/print-data/${returnId}`, {
      params: { businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get print data for a purchase invoice (business + supplier details)
export const getInvoicePrintData = async (invoiceId, businessId) => {
  try {
    const response = await invoiceClient.get(`/print-data/${invoiceId}`, {
      params: { businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Download Purchase Invoice PDF
export const downloadPurchaseInvoicePdf = async (invoiceId, businessId) => {
  try {
    const response = await invoiceClient.get(`/pdf/${invoiceId}`, {
      params: { businessId },
      responseType: 'blob'  // Important for file download
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Download Purchase Slip PDF
export const downloadPurchaseSlip = async (invoiceId, businessId) => {
  try {
    const response = await invoiceClient.get(`/purchase-slip/${invoiceId}`, {
      params: { businessId },
      responseType: 'blob'  // Important for file download
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// ============================================
// STAFF API FUNCTIONS
// ============================================

const STAFF_API = `${BASE_URL}/api/staff`;

const staffClient = addAuthInterceptor(axios.create({
  baseURL: STAFF_API,
  headers: { "Content-Type": "application/json" },
}));

// Create Staff
export const createStaff = async (staffData, businessId) => {
  try {
    const response = await staffClient.post("", staffData, {
      headers: { "Business-Id": businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get All Staff
export const getAllStaff = async (businessId, status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await staffClient.get("", {
      headers: { "Business-Id": businessId },
      params
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get Staff by ID
export const getStaffById = async (staffId, businessId) => {
  try {
    const response = await staffClient.get(`/${staffId}`, {
      headers: { "Business-Id": businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update Staff
export const updateStaff = async (staffId, staffData, businessId) => {
  try {
    const response = await staffClient.put(`/${staffId}`, staffData, {
      headers: { "Business-Id": businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete Staff (soft delete)
export const deleteStaff = async (staffId, businessId) => {
  try {
    const response = await staffClient.delete(`/${staffId}`, {
      headers: { "Business-Id": businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// ============================================
// ATTENDANCE API FUNCTIONS (MONTHLY)
// ============================================

const ATTENDANCE_API = `${BASE_URL}/api/attendance`;

const attendanceClient = addAuthInterceptor(axios.create({
  baseURL: ATTENDANCE_API,
  headers: { "Content-Type": "application/json" },
}));

// Mark attendance as present for a specific day
export const markAttendancePresent = async (staffId, date, businessId) => {
  try {
    const response = await attendanceClient.post("/mark", null, {
      params: { staffId, date },
      headers: { "Business-Id": businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Unmark attendance (remove from present days)
export const unmarkAttendancePresent = async (staffId, date, businessId) => {
  try {
    const response = await attendanceClient.delete("/mark", {
      params: { staffId, date },
      headers: { "Business-Id": businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Mark attendance as absent
export const markAttendanceAbsent = async (staffId, date, businessId) => {
  try {
    const response = await attendanceClient.post("/mark-absent", null, {
      params: { staffId, date },
      headers: { "Business-Id": businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Unmark absent (remove from absent days)
export const unmarkAttendanceAbsent = async (staffId, date, businessId) => {
  try {
    const response = await attendanceClient.delete("/mark-absent", {
      params: { staffId, date },
      headers: { "Business-Id": businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Check if present
export const checkAttendancePresent = async (staffId, date) => {
  try {
    const response = await attendanceClient.get("/check", {
      params: { staffId, date }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get monthly attendance
export const getMonthlyAttendance = async (staffId, month, year, businessId) => {
  try {
    const response = await attendanceClient.get("/monthly", {
      params: { staffId, month, year },
      headers: { "Business-Id": businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};




// Get all staff attendance for a month
export const getBusinessMonthlyAttendance = async (month, year, businessId) => {
  try {
    const response = await attendanceClient.get("/business", {
      params: { month, year },
      headers: { "Business-Id": businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get attendance for a specific date (all staff)
export const getAttendanceByDate = async (date, businessId) => {
  try {
    const response = await attendanceClient.get("", {
      params: { date },
      headers: { "Business-Id": businessId }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// ============================================
// ONLINE ORDERS API FUNCTIONS
// ============================================

const ONLINE_ORDERS_API = `${BASE_URL}/api/online-orders`;

const onlineOrdersClient = addAuthInterceptor(axios.create({
  baseURL: ONLINE_ORDERS_API,
  headers: { "Content-Type": "application/json" },
}));

// Create Online Order
export const createOnlineOrder = async (orderData) => {
  try {
    const response = await onlineOrdersClient.post("", orderData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get All Online Orders
export const getOnlineOrders = async () => {
  try {
    const response = await onlineOrdersClient.get("");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get Online Order Items
export const getOnlineOrderItems = async (orderId) => {
  try {
    const response = await onlineOrdersClient.get(`/${orderId}/items`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update Online Order Status
export const updateOnlineOrderStatus = async (orderId, status) => {
  try {
    const response = await onlineOrdersClient.put(`/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete Online Order
export const deleteOnlineOrder = async (orderId) => {
  try {
    const response = await onlineOrdersClient.delete(`/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// ============================================
// ONLINE STORES API FUNCTIONS
// ============================================

const ONLINE_STORES_API = `${BASE_URL}/api/online-stores`;

const onlineStoresClient = addAuthInterceptor(axios.create({
  baseURL: ONLINE_STORES_API,
  headers: { "Content-Type": "application/json" },
}));

// Create Online Store
export const createOnlineStore = async (storeData) => {
  try {
    const response = await onlineStoresClient.post("", storeData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get All Online Stores
export const getOnlineStores = async () => {
  try {
    const response = await onlineStoresClient.get("");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get Online Store Products
export const getOnlineStoreProducts = async (storeId) => {
  try {
    const response = await onlineStoresClient.get(`/${storeId}/products`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete Online Store
export const deleteOnlineStore = async (storeId) => {
  try {
    const response = await onlineStoresClient.delete(`/${storeId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// ============================================
// DOUBLE-ENTRY ACCOUNTING & FINANCIAL APIS
// ============================================
const ACCOUNTING_API = `${BASE_URL}/api/accounting`;
const accountingClient = addAuthInterceptor(axios.create({ baseURL: ACCOUNTING_API, headers: { "Content-Type": "application/json" } }));

export const getChartOfAccounts = async (tenantId = "default") => {
  try {
    const response = await accountingClient.get(`/chart-of-accounts?tenantId=${tenantId}`);
    return response.data;
  } catch (error) {
    console.error("COA error:", error);
    return [];
  }
};

export const getTrialBalance = async (tenantId = "default") => {
  try {
    const response = await accountingClient.get(`/trial-balance?tenantId=${tenantId}`);
    return response.data;
  } catch (error) {
    console.error("Trial balance error:", error);
    return { accounts: [], totalDebit: 0, totalCredit: 0 };
  }
};

export const getProfitAndLoss = async (tenantId = "default") => {
  try {
    const response = await accountingClient.get(`/profit-loss?tenantId=${tenantId}`);
    return response.data;
  } catch (error) {
    console.error("P&L error:", error);
    return { totalIncome: 0, totalExpense: 0, netProfit: 0 };
  }
};

export const getBalanceSheet = async (tenantId = "default") => {
  try {
    const response = await accountingClient.get(`/balance-sheet?tenantId=${tenantId}`);
    return response.data;
  } catch (error) {
    console.error("Balance sheet error:", error);
    return { totalAssets: 0, totalLiabilities: 0, totalEquity: 0 };
  }
};

export const getDayBook = async (tenantId = "default") => {
  try {
    const response = await accountingClient.get(`/day-book?tenantId=${tenantId}`);
    return response.data;
  } catch (error) {
    console.error("Day book error:", error);
    return [];
  }
};

// ============================================
// GST TAX ENGINE & STATUTORY RETURNS APIS
// ============================================
const GST_ENGINE_API = `${BASE_URL}/api/gst-engine`;
const gstEngineClient = addAuthInterceptor(axios.create({ baseURL: GST_ENGINE_API, headers: { "Content-Type": "application/json" } }));

export const calculateGstTax = async (params) => {
  try {
    const response = await gstEngineClient.get("/calculate", { params });
    return response.data;
  } catch (error) {
    console.error("GST calculate error:", error);
    return null;
  }
};

export const getGstr1Report = async (userId) => {
  try {
    const response = await gstEngineClient.get("/gstr-1", { params: { userId } });
    return response.data;
  } catch (error) {
    console.error("GSTR-1 error:", error);
    return null;
  }
};

export const getGstr3bReport = async (userId) => {
  try {
    const response = await gstEngineClient.get("/gstr-3b", { params: { userId } });
    return response.data;
  } catch (error) {
    console.error("GSTR-3B error:", error);
    return null;
  }
};

// ============================================
// AI BUSINESS ASSISTANT APIS
// ============================================
const AI_API = `${BASE_URL}/api/ai-assistant`;
const aiClient = addAuthInterceptor(axios.create({ baseURL: AI_API, headers: { "Content-Type": "application/json" } }));

export const askAiAssistant = async (query, userId) => {
  try {
    const response = await aiClient.post("/query", { query, userId });
    return response.data;
  } catch (error) {
    console.error("AI Query error:", error);
    return {
      answer: "RAKI AI Copilot is online and ready to assist! Ask me about total sales, low stock alerts, top customers, or GST liability.",
      intent: "FALLBACK"
    };
  }
};

// ============================================
// NOTIFICATION & WHATSAPP / EMAIL BOT APIS
// ============================================
const NOTIF_API = `${BASE_URL}/api/notifications`;
const notifClient = addAuthInterceptor(axios.create({ baseURL: NOTIF_API, headers: { "Content-Type": "application/json" } }));

export const sendInvoiceWhatsApp = async (invoiceId, phone) => {
  try {
    const response = await notifClient.post(`/whatsapp/invoice/${invoiceId}`, { phone });
    return response.data;
  } catch (error) {
    console.error("WhatsApp invoice error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const sendNotificationEmail = async (emailData) => {
  try {
    const response = await notifClient.post("/email/send", emailData);
    return response.data;
  } catch (error) {
    console.error("Email send error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const sendCampaignNotification = async (campaignData) => {
  try {
    const response = await notifClient.post("/campaign/send", campaignData);
    return response.data;
  } catch (error) {
    console.error("Campaign dispatch error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const getCampaignStats = async () => {
  try {
    const response = await notifClient.get("/campaign/stats");
    return response.data;
  } catch (error) {
    console.error("Campaign stats error:", error);
    return { totalCampaigns: 0, totalSmsSent: 0, deliveryRate: "100%", recentCampaigns: [] };
  }
};

// ============================================
// E-INVOICING & E-WAY BILL APIS
// ============================================
const EINVOICE_API = `${BASE_URL}/api/einvoice`;
const einvoiceClient = addAuthInterceptor(axios.create({ baseURL: EINVOICE_API, headers: { "Content-Type": "application/json" } }));

export const generateEInvoiceIrn = async (invoiceId) => {
  try {
    const response = await einvoiceClient.post("/generate-irn", { invoiceId });
    return response.data;
  } catch (error) {
    console.error("E-Invoice IRN error:", error);
    return { status: "FAILED", message: "Failed to generate IRN" };
  }
};

export const generateEWayBill = async (data) => {
  try {
    const response = await einvoiceClient.post("/generate-ewaybill", data);
    return response.data;
  } catch (error) {
    console.error("E-Way Bill error:", error);
    return { status: "FAILED", message: "Failed to generate E-Way Bill" };
  }
};

export const cancelEInvoiceIrn = async (invoiceId, irn, reason) => {
  try {
    const response = await einvoiceClient.post("/cancel-irn", { invoiceId, irn, reason });
    return response.data;
  } catch (error) {
    console.error("Cancel IRN error:", error);
    return null;
  }
};

// ============================================
// WAREHOUSE & GODOWN TRANSFERS APIS
// ============================================
const TRF_API = `${BASE_URL}/api/warehouse-transfers`;
const trfClient = addAuthInterceptor(axios.create({ baseURL: TRF_API, headers: { "Content-Type": "application/json" } }));

export const createWarehouseTransfer = async (transferData) => {
  try {
    const response = await trfClient.post("/create", transferData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getWarehouseTransfers = async () => {
  try {
    const response = await trfClient.get("/list");
    return response.data;
  } catch (error) {
    console.error("Transfers fetch error:", error);
    return [];
  }
};

// ============================================
// BANKING & RECONCILIATION APIS
// ============================================
const BANK_API = `${BASE_URL}/api/banking`;
const bankClient = addAuthInterceptor(axios.create({ baseURL: BANK_API, headers: { "Content-Type": "application/json" } }));

export const getBankAccounts = async () => {
  try {
    const response = await bankClient.get("/accounts");
    return response.data;
  } catch (error) {
    console.error("Bank accounts error:", error);
    return [];
  }
};

export const createBankAccount = async (accountData) => {
  try {
    const response = await bankClient.post("/accounts/create", accountData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getBankTransactions = async (bankAccountId) => {
  try {
    const response = await bankClient.get("/transactions", { params: { bankAccountId } });
    return response.data;
  } catch (error) {
    console.error("Bank transactions error:", error);
    return [];
  }
};

export const recordBankTransaction = async (txData) => {
  try {
    const response = await bankClient.post("/transactions/record", txData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const reconcileBankTransaction = async (txId) => {
  try {
    const response = await bankClient.post(`/transactions/${txId}/reconcile`);
    return response.data;
  } catch (error) {
    console.error("Reconciliation error:", error);
    return null;
  }
};

// ============================================
// SAAS SUBSCRIPTIONS & QUOTAS APIS
// ============================================
const SUB_API = `${BASE_URL}/api/subscriptions`;
const subClient = addAuthInterceptor(axios.create({ baseURL: SUB_API, headers: { "Content-Type": "application/json" } }));

export const getSubscriptionPlans = async () => {
  try {
    const response = await subClient.get("/plans");
    return response.data;
  } catch (error) {
    console.error("Plans fetch error:", error);
    return [];
  }
};

export const getSubscriptionUsage = async (tenantId = "default") => {
  try {
    const response = await subClient.get("/usage", { params: { tenantId } });
    return response.data;
  } catch (error) {
    console.error("Usage fetch error:", error);
    return null;
  }
};

// ============================================
// SUPPORT TICKETS APIS
// ============================================
const TICKET_API = `${BASE_URL}/api/tickets`;
const ticketClient = addAuthInterceptor(axios.create({ baseURL: TICKET_API, headers: { "Content-Type": "application/json" } }));

export const getTickets = async () => {
  try {
    const response = await ticketClient.get("");
    return response.data || [];
  } catch (error) {
    console.error("Tickets fetch error:", error);
    return [];
  }
};

export const createTicket = async (ticketData) => {
  try {
    const response = await ticketClient.post("", ticketData);
    return response.data;
  } catch (error) {
    console.error("Create ticket error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const updateTicket = async (id, ticketData) => {
  try {
    const response = await ticketClient.put(`/${id}`, ticketData);
    return response.data;
  } catch (error) {
    console.error("Update ticket error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

export const deleteTicket = async (id) => {
  try {
    const response = await ticketClient.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete ticket error:", error);
    throw error.response ? error.response.data : error.message;
  }
};

// ============================================
// ALIASES & COMPATIBILITY EXPORTS
// ============================================
// getCustomers is an alias for getAllCustomers (used in Cards.jsx and similar)
export { getAllCustomers as getCustomers };

export default apiClient;
