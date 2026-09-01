import axios from "axios";

// Automatically detects backend URL (Localhost on Web, 10.0.2.2 on Android Emulator, or custom LAN IP)
const getBaseUrl = () => {
  const customIp = localStorage.getItem("tsar_server_ip");
  if (customIp) return `http://${customIp}:8081`;
  
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:8081";
  }
  // Android Emulator default gateway
  return "http://10.0.2.2:8081";
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor to inject JWT token and Tenant ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
