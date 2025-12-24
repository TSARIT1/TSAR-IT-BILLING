import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsBuilding,
  BsGeoAltFill,
  BsPersonFill,
  BsTelephoneFill,
  BsPlus,
  BsPencilSquare,
  BsTrash,
  BsCalendar3,
  BsCheckCircle,
  BsXCircle,
  BsBox,
  BsUpcScan,
  BsTag,
  BsCashCoin,
  BsPercent,
  BsBoxSeam,
  BsFileText,
  BsFileEarmarkPdf,
  BsDownload
} from "react-icons/bs";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../godown.css";
import { createGodown, getGodowns, getGodownById, updateGodown, deleteGodown, createProduct, getProductsByGodown, updateProduct, deleteProduct, downloadGodownReport } from "../../services/api";

function Godown() {
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  // Filter states
  const [selectedGodownFilter, setSelectedGodownFilter] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");

  // Godown table filter states
  const [selectedGodownNameFilter, setSelectedGodownNameFilter] = useState("");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("");

  // Reports dropdown state
  const [showReportsDropdown, setShowReportsDropdown] = useState(false);

  const [godownData, setGodownData] = useState({
    name: "",
    city: "",
    manager: "",
    contact: "",
  });

  const [productData, setProductData] = useState({
    godownId: "",
    name: "",
    productCode: "",
    barcode: "",
    category: "",
    manufacturerName: "",
    supplierName: "",
    description: "",
    stockQuantity: "",
    unit: "",
    minStockLevel: "",
    purchasePrice: "",
    sellingPrice: "",
    discount: "",
    taxRate: "",
    expiryDate: ""
  });

  const [godowns, setGodowns] = useState([]);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products from all godowns
  const [errors, setErrors] = useState({});

  const categories = [
    "Electronics",
    "Clothing",
    "Food & Beverages",
    "Furniture",
    "Stationery",
    "Hardware",
    "Cosmetics",
    "Pharmaceuticals",
    "Automotive",
    "Sports Equipment",
    "Books",
    "Toys",
    "Other"
  ];

  // Authentication check - runs on component mount
  useEffect(() => {
    console.log("========== GODOWN PAGE ACCESS CHECK ==========");
    console.log("Checking for userBusinessId in localStorage...");

    // Check if userBusinessId exists in localStorage
    const storedUserBusinessId = localStorage.getItem("userBusinessId");

    console.log("userBusinessId from localStorage:", storedUserBusinessId);
    console.log("All localStorage keys:", Object.keys(localStorage));

    if (!storedUserBusinessId) {
      console.error("❌ userBusinessId NOT FOUND in localStorage!");
      console.log("Current localStorage contents:");
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          console.log(`  ${key}: ${localStorage.getItem(key)}`);
        }
      }
      alert("Please create the business profile first to access Godown Management.");
      navigate("/dashboard");
      return;
    }

    console.log("✅ userBusinessId found! Access granted.");
    console.log("==============================================");

    // Store userBusinessId in state
    setBusinessId(storedUserBusinessId);
  }, [navigate]);

  useEffect(() => {
    // Only fetch godowns if business ID is available
    if (businessId) {
      fetchGodowns();
    }
  }, [businessId]);

  // Fetch products when godowns are loaded
  useEffect(() => {
    if (godowns.length > 0) {
      // Automatically fetch products for the first godown
      console.log("Godowns loaded, fetching products for first godown:", godowns[0].godownId);
      fetchProducts(godowns[0].godownId);
      // Also fetch all products from all godowns for summary calculations
      fetchAllProducts();
    }
  }, [godowns]);

  // Fetch products for a specific godown
  const fetchProducts = async (godownId) => {
    if (!godownId) {
      console.log("No godown selected, clearing products");
      setProducts([]);
      return;
    }

    try {
      console.log("Fetching products for godown:", godownId);
      const data = await getProductsByGodown(godownId);

      if (!data || data.length === 0) {
        console.log("No products found for this godown");
        setProducts([]);
      } else {
        console.log(`Found ${data.length} product(s)`);
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);

      if (error.response?.status !== 404) {
        console.log("Failed to load products:", error.message);
      }
    }
  };

  // Fetch all products from all godowns for summary calculations
  const fetchAllProducts = async () => {
    if (godowns.length === 0) {
      setAllProducts([]);
      return;
    }

    try {
      console.log("Fetching products from all godowns...");
      const allProductsPromises = godowns.map(godown =>
        getProductsByGodown(godown.godownId)
          .catch(error => {
            console.error(`Error fetching products for godown ${godown.godownId}:`, error);
            return []; // Return empty array if fetch fails for this godown
          })
      );

      const allProductsArrays = await Promise.all(allProductsPromises);
      const combinedProducts = allProductsArrays.flat(); // Flatten array of arrays

      console.log(`Fetched ${combinedProducts.length} total products from ${godowns.length} godowns`);
      setAllProducts(combinedProducts);
    } catch (error) {
      console.error("Error fetching all products:", error);
      setAllProducts([]);
    }
  };

  // Computed filtered products based on selections
  const filteredProducts = products.filter(product => {
    const matchesGodown = !selectedGodownFilter || product.godownId === selectedGodownFilter;
    const matchesCategory = !selectedCategoryFilter || product.category === selectedCategoryFilter;
    return matchesGodown && matchesCategory;
  });

  // Handle filter changes
  const handleGodownFilterChange = async (e) => {
    const godownId = e.target.value;
    setSelectedGodownFilter(godownId);
    setSelectedCategoryFilter(""); // Reset category filter

    if (godownId) {
      await fetchProducts(godownId);
    } else {
      if (godowns.length > 0) {
        await fetchProducts(godowns[0].godownId);
      }
    }
  };

  const handleCategoryFilterChange = (e) => {
    setSelectedCategoryFilter(e.target.value);
  };

  const handleClearFilters = async () => {
    setSelectedGodownFilter("");
    setSelectedCategoryFilter("");
    if (godowns.length > 0) {
      await fetchProducts(godowns[0].godownId);
    }
  };

  // Computed filtered godowns based on selections
  const filteredGodowns = godowns.filter(godown => {
    const matchesName = !selectedGodownNameFilter || godown.godownName === selectedGodownNameFilter;
    const matchesLocation = !selectedLocationFilter || godown.location === selectedLocationFilter;
    return matchesName && matchesLocation;
  });

  // Handle godown table filter changes
  const handleGodownNameFilterChange = (e) => {
    setSelectedGodownNameFilter(e.target.value);
  };

  const handleLocationFilterChange = (e) => {
    setSelectedLocationFilter(e.target.value);
  };

  const handleClearGodownFilters = () => {
    setSelectedGodownNameFilter("");
    setSelectedLocationFilter("");
  };

  const fetchGodowns = async () => {
    try {
      const data = await getGodowns(businessId);
      setGodowns(data);
    } catch (error) {
      console.error("Error fetching godowns:", error);
      alert("Failed to load godowns: " + (error.message || "Unknown error"));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGodownData({ ...godownData, [name]: value });
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateProductForm = () => {
    const newErrors = {};

    // Godown selection validation
    if (!productData.godownId) {
      newErrors.godownId = "Please select a godown";
    }

    if (!productData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!productData.productCode.trim()) {
      newErrors.productCode = "Product code is required";
    }
    if (!productData.category) {
      newErrors.category = "Please select a category";
    }
    if (!productData.stockQuantity || productData.stockQuantity <= 0) {
      newErrors.stockQuantity = "Stock quantity must be greater than 0";
    }
    if (!productData.unit.trim()) {
      newErrors.unit = "Unit is required";
    }
    if (!productData.purchasePrice || productData.purchasePrice <= 0) {
      newErrors.purchasePrice = "Purchase price must be greater than 0";
    }
    if (!productData.sellingPrice || productData.sellingPrice <= 0) {
      newErrors.sellingPrice = "Selling price must be greater than 0";
    }

    if (productData.minStockLevel && productData.minStockLevel < 0) {
      newErrors.minStockLevel = "Minimum stock level cannot be negative";
    }
    if (productData.discount && (productData.discount < 0 || productData.discount > 100)) {
      newErrors.discount = "Discount must be between 0 and 100";
    }
    if (productData.taxRate && (productData.taxRate < 0 || productData.taxRate > 100)) {
      newErrors.taxRate = "Tax rate must be between 0 and 100";
    }

    if (productData.expiryDate) {
      const today = new Date();
      const expiry = new Date(productData.expiryDate);
      if (expiry < today) {
        newErrors.expiryDate = "Expiry date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGodown = async () => {
    const { name, city, manager, contact } = godownData;
    if (!name || !city || !manager || !contact) {
      alert("Please fill all fields!");
      return;
    }

    try {
      const storedUserBusinessId = localStorage.getItem("userBusinessId");

      if (!storedUserBusinessId) {
        alert("Business profile not found. Please create a business profile first.");
        navigate("/dashboard");
        return;
      }

      if (editingIndex !== null) {
        // UPDATE existing godown
        const godown = godowns[editingIndex];
        const updateRequest = {
          godownName: name,
          location: city,
          managerName: manager,
          contactNo: contact,
          userBusinessId: storedUserBusinessId
        };

        console.log("Updating godown ID:", godown.godownId, "with data:", updateRequest);
        await updateGodown(godown.godownId, updateRequest);
        alert("Godown updated successfully!");
        setEditingIndex(null);
      } else {
        // CREATE new godown
        const godownRequest = {
          godownId: "GD" + Date.now(),
          godownName: name,
          location: city,
          managerName: manager,
          contactNo: contact,
          businessId: storedUserBusinessId
        };

        await createGodown(godownRequest);
        alert("Godown created successfully!");
      }

      // Refresh the list
      await fetchGodowns();

      // Reset form
      setGodownData({ name: "", city: "", manager: "", contact: "" });
      setShowModal(false);
    } catch (error) {
      console.error("Error saving godown:", error);
      alert("Failed to save godown: " + (error.message || "Unknown error"));
    }
  };

  const handleAddProduct = async () => {
    if (!validateProductForm()) {
      alert("Please fix all validation errors before saving");
      return;
    }

    try {
      if (editingProductIndex !== null) {
        // UPDATE existing product
        const product = products[editingProductIndex];
        const productId = parseInt(product.productId) || parseInt(product.id);

        if (!productId) {
          alert("Product ID not found. Cannot update.");
          return;
        }

        const updateRequest = {
          productCode: productData.productCode,
          productName: productData.name,
          category: productData.category,
          unit: productData.unit,
          purchasePrice: parseFloat(productData.purchasePrice),
          sellingPrice: parseFloat(productData.sellingPrice),
          stockQuantity: parseInt(productData.stockQuantity),
          minStockLevel: parseInt(productData.minStockLevel) || 0,
          barcode: productData.barcode || productData.productCode + "_1",
          taxRate: parseFloat(productData.taxRate) || 0,
          discount: parseFloat(productData.discount) || 0,
          expiryDate: productData.expiryDate || null,
          manufacturerNameOrCode: productData.manufacturerName || "",
          supplierNameOrCode: productData.supplierName || "",
          description: productData.description || ""
        };

        await updateProduct(productId, updateRequest);
        alert("Product updated successfully!");
        setEditingProductIndex(null);
      } else {
        // CREATE new product
        const storedUserBusinessId = localStorage.getItem("userBusinessId");

        if (!storedUserBusinessId) {
          alert("Business profile not found. Please create a business profile first.");
          return;
        }

        if (!productData.godownId) {
          alert("Please select a godown before adding a product.");
          return;
        }

        const productRequest = {
          productCode: productData.productCode,
          productName: productData.name,
          category: productData.category,
          unit: productData.unit,
          purchasePrice: parseFloat(productData.purchasePrice),
          sellingPrice: parseFloat(productData.sellingPrice),
          stockQuantity: parseInt(productData.stockQuantity),
          minStockLevel: parseInt(productData.minStockLevel) || 0,
          taxRate: parseFloat(productData.taxRate) || 0,
          discount: parseFloat(productData.discount) || 0,
          expiryDate: productData.expiryDate || null,
          barcode: productData.barcode || productData.productCode + "_1",
          manufacturerName: productData.manufacturerName || "",
          supplierName: productData.supplierName || "",
          description: productData.description || "",
          godownId: productData.godownId,
          userBusinessId: storedUserBusinessId
        };

        await createProduct(productRequest);
        alert("Product added successfully!");
      }

      // Refresh products list
      if (productData.godownId) {
        await fetchProducts(productData.godownId);
      }
      // Refresh all products for summary calculations
      await fetchAllProducts();

      resetProductForm();
      setShowProductModal(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product: " + (error.message || "Unknown error"));
    }
  };

  const resetProductForm = () => {
    setProductData({
      godownId: "",
      name: "",
      productCode: "",
      barcode: "",
      category: "",
      manufacturerName: "",
      supplierName: "",
      description: "",
      stockQuantity: "",
      unit: "",
      minStockLevel: "",
      purchasePrice: "",
      sellingPrice: "",
      discount: "",
      taxRate: "",
      expiryDate: ""
    });
    setErrors({});
  };

  const handleEditGodown = async (index) => {
    const godown = godowns[index];
    try {
      const godownDetails = await getGodownById(godown.godownId);
      setGodownData({
        name: godownDetails.godownName,
        city: godownDetails.location,
        manager: godownDetails.managerName,
        contact: godownDetails.contactNo
      });
      setEditingIndex(index);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching godown details:", error);
      alert("Failed to load godown details: " + (error.message || "Unknown error"));
    }
  };

  const handleEditProduct = (index) => {
    const product = products[index];
    setProductData({
      godownId: product.godownId || "",
      name: product.productName || product.name || "",
      productCode: product.productCode || "",
      barcode: product.barcode || "",
      category: product.category || "",
      manufacturerName: product.manufacturerName || "",
      supplierName: product.supplierName || "",
      description: product.description || "",
      stockQuantity: product.stockQuantity || "",
      unit: product.unit || "",
      minStockLevel: product.minStockLevel || "",
      purchasePrice: product.purchasePrice || "",
      sellingPrice: product.sellingPrice || "",
      discount: product.discount || "",
      taxRate: product.taxRate || "",
      expiryDate: product.expiryDate || ""
    });
    setEditingProductIndex(index);
    setShowProductModal(true);
  };

  const handleDeleteGodown = async (index) => {
    const godown = godowns[index];
    if (window.confirm(`Are you sure you want to delete "${godown.godownName}"?`)) {
      try {
        await deleteGodown(godown.godownId);
        alert("Godown deleted successfully!");

        // Refresh the list
        await fetchGodowns();
      } catch (error) {
        console.error("Error deleting godown:", error);
        alert("Failed to delete godown: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleDeleteProduct = async (index) => {
    const product = products[index];
    const productName = product.productName || product.name || "this product";

    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        const productId = parseInt(product.productId) || parseInt(product.id);

        if (!productId) {
          alert("Product ID not found. Cannot delete.");
          return;
        }

        await deleteProduct(productId);
        alert("Product deleted successfully!");

        // Refresh products list
        if (product.godownId) {
          await fetchProducts(product.godownId);
        }
        // Refresh all products for summary calculations
        await fetchAllProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setGodownData({ name: "", city: "", manager: "", contact: "" });
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setEditingProductIndex(null);
    resetProductForm();
  };

  // Download PDF Report
  const handleDownloadPDF = async () => {
    try {
      const storedUserBusinessId = localStorage.getItem("userBusinessId");

      if (!storedUserBusinessId) {
        alert("Business profile not found. Please create a business profile first.");
        return;
      }

      const blob = await downloadGodownReport(storedUserBusinessId);

      // Check if response is JSON (error) instead of PDF
      if (blob.type === 'application/json') {
        const text = await blob.text();
        console.error("Backend returned JSON error:", text);
        alert("Backend error: " + text);
        return;
      }

      // Check if it's actually a PDF
      if (blob.type !== 'application/pdf' && blob.type !== 'application/octet-stream') {
        console.error("Unexpected content type:", blob.type);
        alert("Error: Backend did not return a PDF file. Received: " + blob.type);
        return;
      }

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Godown_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF report: " + (error.message || "Unknown error"));
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">

          {/* Modern Page Header */}
          <div className="godown-page-header">
            <div className="godown-header-content">
              <div className="godown-title-section">
                <h2 className="godown-page-title">
                  <BsBuilding className="godown-title-icon" /> Godown Management
                </h2>
                <p className="godown-page-subtitle">Manage warehouses and product inventory</p>
              </div>
              <div className="godown-header-actions">
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    className="product-add-btn"
                    onClick={() => setShowReportsDropdown(!showReportsDropdown)}
                    title="Reports"
                  >
                    <BsFileEarmarkPdf /> Reports
                  </button>
                  {showReportsDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '5px',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      minWidth: '180px'
                    }}>
                      <button
                        onClick={() => {
                          handleDownloadPDF();
                          setShowReportsDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 15px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#333'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <BsFileEarmarkPdf style={{ color: '#e8961b' }} /> Download as PDF
                      </button>
                    </div>
                  )}
                </div>
                <button className="godown-add-btn" onClick={() => setShowModal(true)}>
                  <BsPlus /> Add Godown
                </button>
                <button className="product-add-btn" onClick={() => setShowProductModal(true)}>
                  <BsBox /> Add Product
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="godown-summary-row">
            <div className="godown-summary-card">
              <div className="godown-summary-icon-wrapper godown-icon">
                <BsBuilding className="godown-summary-icon" />
              </div>
              <div className="godown-summary-content">
                <h4>Total Godowns</h4>
                <p>{godowns.length}</p>
              </div>
            </div>
            <div className="godown-summary-card">
              <div className="godown-summary-icon-wrapper product-icon">
                <BsBox className="godown-summary-icon" />
              </div>
              <div className="godown-summary-content">
                <h4>Total Products</h4>
                <p>{allProducts.length}</p>
              </div>
            </div>
            <div className="godown-summary-card">
              <div className="godown-summary-icon-wrapper stock-icon">
                <BsBoxSeam className="godown-summary-icon" />
              </div>
              <div className="godown-summary-content">
                <h4>Total Stock</h4>
                <p>{allProducts.reduce((sum, p) => sum + (parseInt(p.stockQuantity) || 0), 0)}</p>
              </div>
            </div>
          </div>

          {/* Products Table */}
          {products.length > 0 && (
            <div className="products-section">
              <div className="section-header">
                <h3><BsBox /> Products Inventory</h3>
              </div>

              {/* Product Filter Section */}
              <div className="godown-filter-section" style={{
                display: 'flex',
                gap: '15px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '20px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
                    <BsBuilding style={{ marginRight: '5px' }} />
                    Filter by Godown
                  </label>
                  <select
                    value={selectedGodownFilter}
                    onChange={handleGodownFilterChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">All Godowns</option>
                    {godowns.map((godown) => (
                      <option key={godown.godownId} value={godown.godownId}>
                        {godown.godownName}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
                    <BsTag style={{ marginRight: '5px' }} />
                    Filter by Category
                  </label>
                  <select
                    value={selectedCategoryFilter}
                    onChange={handleCategoryFilterChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={handleClearFilters}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <BsXCircle style={{ marginRight: '5px' }} />
                    Clear Filters
                  </button>
                </div>

                <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6c757d' }}>
                  Showing {filteredProducts.length} of {products.length} products
                </div>
              </div>

              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th><BsBuilding /> Godown</th>
                      <th><BsTag /> Category</th>
                      <th>Supplier</th>
                      <th><BsBox /> Product Name</th>
                      <th>Stock Qty</th>
                      <th>Units</th>
                      <th><BsCashCoin /> Purchase Price</th>
                      <th><BsCashCoin /> Selling Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, index) => (
                      <tr key={product.productId || product.id}>
                        <td className="product-id-cell">
                          #{(product.productId || product.id) ? (product.productId || product.id).toString().slice(-6) : "N/A"}
                        </td>
                        <td>
                          {godowns.find(g => g.godownId === product.godownId)?.godownName || "-"}
                        </td>
                        <td>
                          <span className="category-badge">{product.category}</span>
                        </td>
                        <td>{product.supplierName || "-"}</td>
                        <td className="product-name-cell">
                          <BsBox className="product-icon" /> {product.productName || product.name}
                        </td>
                        <td className={product.stockQuantity <= (product.minStockLevel || 0) ? "low-stock" : ""}>
                          {product.stockQuantity}
                        </td>
                        <td>{product.unit}</td>
                        <td className="price-cell">
                          ₹{product.purchasePrice
                            ? parseFloat(product.purchasePrice).toFixed(2)
                            : "0.00"}
                        </td>
                        <td className="price-cell">
                          ₹{product.sellingPrice
                            ? parseFloat(product.sellingPrice).toFixed(2)
                            : "0.00"}
                        </td>
                        <td className="product-actions-cell">
                          <button
                            className="product-action-btn edit-btn"
                            onClick={() => handleEditProduct(index)}
                            title="Edit Product"
                          >
                            <BsPencilSquare />
                          </button>
                          <button
                            className="product-action-btn delete-btn"
                            onClick={() => handleDeleteProduct(index)}
                            title="Delete Product"
                          >
                            <BsTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Godowns List */}
          {godowns.length > 0 && (
            <div className="godown-list-container">
              <div className="section-header">
                <h3><BsBuilding /> Godown Locations</h3>
              </div>

              {/* Godown Filter Section */}
              <div className="godown-filter-section" style={{
                display: 'flex',
                gap: '15px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '20px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
                    <BsBuilding style={{ marginRight: '5px' }} />
                    Filter by Godown Name
                  </label>
                  <select
                    value={selectedGodownNameFilter}
                    onChange={handleGodownNameFilterChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">All Godowns</option>
                    {[...new Set(godowns.map(g => g.godownName))].map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#495057' }}>
                    <BsGeoAltFill style={{ marginRight: '5px' }} />
                    Filter by Location
                  </label>
                  <select
                    value={selectedLocationFilter}
                    onChange={handleLocationFilterChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">All Locations</option>
                    {[...new Set(godowns.map(g => g.location))].map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={handleClearGodownFilters}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <BsXCircle style={{ marginRight: '5px' }} />
                    Clear Filters
                  </button>
                </div>

                <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6c757d' }}>
                  Showing {filteredGodowns.length} of {godowns.length} godowns
                </div>
              </div>

              <div className="godown-table-container">
                <table className="godown-table">
                  <thead>
                    <tr>
                      <th><BsBuilding /> Godown Name</th>
                      <th><BsGeoAltFill /> City</th>
                      <th><BsPersonFill /> Manager</th>
                      <th><BsTelephoneFill /> Contact</th>
                      <th><BsCalendar3 /> Created On</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGodowns.map((g, i) => (
                      <tr key={i}>
                        <td className="godown-name-cell">
                          <BsBuilding className="godown-row-icon" /> {g.godownName}
                        </td>
                        <td>{g.location}</td>
                        <td>{g.managerName}</td>
                        <td>{g.contactNo}</td>
                        <td>{g.createdDate ? new Date(g.createdDate).toLocaleDateString() : '-'}</td>
                        <td className="godown-actions-cell">
                          <button
                            className="godown-action-btn edit-btn"
                            onClick={() => handleEditGodown(i)}
                            title="Edit Godown"
                          >
                            <BsPencilSquare />
                          </button>
                          <button
                            className="godown-action-btn delete-btn"
                            onClick={() => handleDeleteGodown(i)}
                            title="Delete Godown"
                          >
                            <BsTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {godowns.length === 0 && products.length === 0 && (
            <div className="godown-empty-container">
              <div className="godown-empty-content">
                <div className="godown-empty-icon-wrapper">
                  <BsBuilding className="godown-empty-icon" />
                </div>
                <h3>Start Managing Your Inventory!</h3>
                <p>
                  Add godowns and products to track your inventory efficiently
                </p>
                <div className="empty-actions">
                  <button className="godown-enable-btn" onClick={() => setShowModal(true)}>
                    <BsPlus /> Add Godown
                  </button>
                  <button className="product-enable-btn" onClick={() => setShowProductModal(true)}>
                    <BsBox /> Add Product
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GODOWN MODAL */}
          {showModal && (
            <div className="godown-modal-overlay" onClick={handleCloseModal}>
              <div className="godown-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="godown-modal-header">
                  <h3>
                    <BsBuilding /> {editingIndex !== null ? "Edit Godown" : "Add New Godown"}
                  </h3>
                  <button className="godown-modal-close" onClick={handleCloseModal}>
                    <BsXCircle />
                  </button>
                </div>

                <div className="godown-modal-body">
                  <div className="godown-input-group">
                    <label className="godown-input-label">
                      <BsBuilding className="label-icon-godown" /> Godown Name
                    </label>
                    <div className="godown-input-wrapper">
                      <BsBuilding className="godown-input-icon" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter godown name"
                        value={godownData.name}
                        onChange={handleInputChange}
                        className="godown-input"
                      />
                    </div>
                  </div>

                  <div className="godown-input-group">
                    <label className="godown-input-label">
                      <BsGeoAltFill className="label-icon-godown" /> City / Location
                    </label>
                    <div className="godown-input-wrapper">
                      <BsGeoAltFill className="godown-input-icon" />
                      <input
                        type="text"
                        name="city"
                        placeholder="Enter city or location"
                        value={godownData.city}
                        onChange={handleInputChange}
                        className="godown-input"
                      />
                    </div>
                  </div>

                  <div className="godown-input-group">
                    <label className="godown-input-label">
                      <BsPersonFill className="label-icon-godown" /> Manager Name
                    </label>
                    <div className="godown-input-wrapper">
                      <BsPersonFill className="godown-input-icon" />
                      <input
                        type="text"
                        name="manager"
                        placeholder="Enter manager name"
                        value={godownData.manager}
                        onChange={handleInputChange}
                        className="godown-input"
                      />
                    </div>
                  </div>

                  <div className="godown-input-group">
                    <label className="godown-input-label">
                      <BsTelephoneFill className="label-icon-godown" /> Contact Number
                    </label>
                    <div className="godown-input-wrapper">
                      <BsTelephoneFill className="godown-input-icon" />
                      <input
                        type="text"
                        name="contact"
                        placeholder="Enter contact number"
                        value={godownData.contact}
                        onChange={handleInputChange}
                        className="godown-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="godown-modal-footer">
                  <button className="godown-cancel-btn" onClick={handleCloseModal}>
                    <BsXCircle /> Cancel
                  </button>
                  <button className="godown-save-btn" onClick={handleAddGodown}>
                    <BsCheckCircle /> {editingIndex !== null ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCT MODAL */}
          {showProductModal && (
            <div className="product-modal-overlay" onClick={handleCloseProductModal}>
              <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="product-modal-header">
                  <h3>
                    <BsBox /> {editingProductIndex !== null ? "Edit Product" : "Add New Product"}
                  </h3>
                  <button className="product-modal-close" onClick={handleCloseProductModal}>
                    <BsXCircle />
                  </button>
                </div>

                <div className="product-modal-body">
                  <div className="product-form-grid">

                    {/* Godown Selection */}
                    <div className="product-input-group full-width">
                      <label className="product-input-label">
                        <BsBuilding className="label-icon-product" /> Godown / Warehouse *
                      </label>
                      <select
                        name="godownId"
                        value={productData.godownId}
                        onChange={handleProductInputChange}
                        className={`product-select ${errors.godownId ? 'error' : ''}`}
                      >
                        <option value="">Select Godown</option>
                        {godowns.map((godown, idx) => (
                          <option key={idx} value={godown.godownId}>
                            {godown.godownName} - {godown.location}
                          </option>
                        ))}
                      </select>
                      {errors.godownId && <span className="error-message">{errors.godownId}</span>}
                    </div>

                    {/* Product Name */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsBox className="label-icon-product" /> Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter product name"
                        value={productData.name}
                        onChange={handleProductInputChange}
                        className={`product-input ${errors.name ? 'error' : ''}`}
                      />
                      {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    {/* Product Code */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsUpcScan className="label-icon-product" /> Product Code *
                      </label>
                      <input
                        type="text"
                        name="productCode"
                        placeholder="Enter product code"
                        value={productData.productCode}
                        onChange={handleProductInputChange}
                        className={`product-input ${errors.productCode ? 'error' : ''}`}
                      />
                      {errors.productCode && <span className="error-message">{errors.productCode}</span>}
                    </div>

                    {/* Barcode */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsUpcScan className="label-icon-product" /> Barcode
                      </label>
                      <input
                        type="text"
                        name="barcode"
                        placeholder="Enter barcode"
                        value={productData.barcode}
                        onChange={handleProductInputChange}
                        className="product-input"
                      />
                    </div>

                    {/* Category */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsTag className="label-icon-product" /> Category *
                      </label>
                      <select
                        name="category"
                        value={productData.category}
                        onChange={handleProductInputChange}
                        className={`product-select ${errors.category ? 'error' : ''}`}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.category && <span className="error-message">{errors.category}</span>}
                    </div>

                    {/* Manufacturer */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsBuilding className="label-icon-product" /> Manufacturer
                      </label>
                      <input
                        type="text"
                        name="manufacturerName"
                        placeholder="Enter manufacturer name/code"
                        value={productData.manufacturerName}
                        onChange={handleProductInputChange}
                        className="product-input"
                      />
                    </div>

                    {/* Supplier */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsPersonFill className="label-icon-product" /> Supplier
                      </label>
                      <input
                        type="text"
                        name="supplierName"
                        placeholder="Enter supplier name/code"
                        value={productData.supplierName}
                        onChange={handleProductInputChange}
                        className="product-input"
                      />
                    </div>

                    {/* Stock Quantity */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsBoxSeam className="label-icon-product" /> Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="stockQuantity"
                        placeholder="Enter stock quantity"
                        value={productData.stockQuantity}
                        onChange={handleProductInputChange}
                        className={`product-input ${errors.stockQuantity ? 'error' : ''}`}
                        min="0"
                      />
                      {errors.stockQuantity && <span className="error-message">{errors.stockQuantity}</span>}
                    </div>

                    {/* Unit */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsBox className="label-icon-product" /> Unit *
                      </label>
                      <input
                        type="text"
                        name="unit"
                        placeholder="e.g., pcs, kg, ltr"
                        value={productData.unit}
                        onChange={handleProductInputChange}
                        className={`product-input ${errors.unit ? 'error' : ''}`}
                      />
                      {errors.unit && <span className="error-message">{errors.unit}</span>}
                    </div>

                    {/* Min Stock Level */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsBoxSeam className="label-icon-product" /> Min Stock Level
                      </label>
                      <input
                        type="number"
                        name="minStockLevel"
                        placeholder="Minimum stock level"
                        value={productData.minStockLevel}
                        onChange={handleProductInputChange}
                        className={`product-input ${errors.minStockLevel ? 'error' : ''}`}
                        min="0"
                      />
                      {errors.minStockLevel && <span className="error-message">{errors.minStockLevel}</span>}
                    </div>

                    {/* Purchase Price */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsCashCoin className="label-icon-product" /> Purchase Price *
                      </label>
                      <input
                        type="number"
                        name="purchasePrice"
                        placeholder="Enter purchase price"
                        value={productData.purchasePrice}
                        onChange={handleProductInputChange}
                        className={`product-input ${errors.purchasePrice ? 'error' : ''}`}
                        min="0"
                        step="0.01"
                      />
                      {errors.purchasePrice && <span className="error-message">{errors.purchasePrice}</span>}
                    </div>

                    {/* Selling Price */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsCashCoin className="label-icon-product" /> Selling Price *
                      </label>
                      <input
                        type="number"
                        name="sellingPrice"
                        placeholder="Enter selling price"
                        value={productData.sellingPrice}
                        onChange={handleProductInputChange}
                        className={`product-input ${errors.sellingPrice ? 'error' : ''}`}
                        min="0"
                        step="0.01"
                      />
                      {errors.sellingPrice && <span className="error-message">{errors.sellingPrice}</span>}
                    </div>

                    {/* Discount */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsPercent className="label-icon-product" /> Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        placeholder="Enter discount %"
                        value={productData.discount}
                        onChange={handleProductInputChange}
                        className={`product-input ${errors.discount ? 'error' : ''}`}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      {errors.discount && <span className="error-message">{errors.discount}</span>}
                    </div>

                    {/* Tax Rate */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsPercent className="label-icon-product" /> Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        name="taxRate"
                        placeholder="Enter tax rate %"
                        value={productData.taxRate}
                        onChange={handleProductInputChange}
                        className={`product-input ${errors.taxRate ? 'error' : ''}`}
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      {errors.taxRate && <span className="error-message">{errors.taxRate}</span>}
                    </div>

                    {/* Expiry Date */}
                    <div className="product-input-group">
                      <label className="product-input-label">
                        <BsCalendar3 className="label-icon-product" /> Expiry Date
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={productData.expiryDate}
                        onChange={handleProductInputChange}
                        className={`product-input ${errors.expiryDate ? 'error' : ''}`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                    </div>

                    {/* Description - Full Width */}
                    <div className="product-input-group full-width">
                      <label className="product-input-label">
                        <BsFileText className="label-icon-product" /> Description
                      </label>
                      <textarea
                        name="description"
                        placeholder="Enter product description (max 1000 characters)"
                        value={productData.description}
                        onChange={handleProductInputChange}
                        className="product-textarea"
                        maxLength="1000"
                        rows="3"
                      />
                      <span className="char-count">{productData.description.length}/1000</span>
                    </div>
                  </div>
                </div>

                <div className="product-modal-footer">
                  <button className="product-cancel-btn btn btn-secondary" onClick={handleCloseProductModal}>
                    <BsXCircle /> Cancel
                  </button>
                  <button className="product-save-btn btn btn-primary" onClick={handleAddProduct}>
                    <BsCheckCircle /> {editingProductIndex !== null ? "Update Product" : "Save Product"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Godown;
