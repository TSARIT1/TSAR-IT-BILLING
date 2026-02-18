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

const SALES_API = "http://localhost:8081/api/sales";

const salesClient = axios.create({
  baseURL: SALES_API,
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
const PURCHASE_RETURN_API = "http://localhost:8081/api/purchase-returns";

const purchaseReturnClient = axios.create({
  baseURL: PURCHASE_RETURN_API,
  headers: {
    "Content-Type": "application/json"
  },
});

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

const STAFF_API = "http://localhost:8081/api/staff";

const staffClient = axios.create({
  baseURL: STAFF_API,
  headers: {
    "Content-Type": "application/json"
  },
});

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

const ATTENDANCE_API = "http://localhost:8081/api/attendance";

const attendanceClient = axios.create({
  baseURL: ATTENDANCE_API,
  headers: {
    "Content-Type": "application/json"
  },
});

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

const ONLINE_ORDERS_API = "http://localhost:8081/api/online-orders";

const onlineOrdersClient = axios.create({
  baseURL: ONLINE_ORDERS_API,
  headers: {
    "Content-Type": "application/json"
  },
});

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

const ONLINE_STORES_API = "http://localhost:8081/api/online-stores";

const onlineStoresClient = axios.create({
  baseURL: ONLINE_STORES_API,
  headers: { "Content-Type": "application/json" },
});

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
