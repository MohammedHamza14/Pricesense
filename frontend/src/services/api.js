/**
 * services/api.js
 * Centralised Axios service layer for PriceSense.
 * All components import from here — no raw axios calls in page components.
 */

import axios from "axios";

const http = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
});

// ── Dashboard ──────────────────────────────────────────
export const getDashboard        = ()          => http.get("/dashboard/");
export const getProductAnalysis  = ()          => http.get("/product-analysis/");
export const getInsights         = ()          => http.get("/insights/");
export const getRecommendations  = ()          => http.get("/recommendations/");

// ── CSV Upload ─────────────────────────────────────────
export const uploadCSV = (formData) =>
  axios.post("http://127.0.0.1:8000/api/upload-csv/", formData);
// NOTE: uses raw axios (not http instance) to preserve multipart/form-data header

// ── Products ───────────────────────────────────────────
export const getProducts   = ()               => http.get("/products/");
export const addProduct    = (data)           => http.post("/add-product/", data);
export const updateProduct = (id, data)       => http.put(`/products/${id}/`, data);
export const deleteProduct = (id)             => http.delete(`/products/${id}/`);
export const clearProducts = ()               => http.delete("/clear-products/");

// ── Sales ──────────────────────────────────────────────
export const getSales   = ()           => http.get("/sales/");
export const addSale    = (data)       => http.post("/add-sale/", data);
export const updateSale = (id, data)   => http.put(`/sales/${id}/`, data);
export const deleteSale = (id)         => http.delete(`/sales/${id}/`);
export const clearSales = ()           => http.delete("/clear-sales/");

// ── AI Predictions ─────────────────────────────────────
export const getPredictions = ()       => http.get("/predictions/");
