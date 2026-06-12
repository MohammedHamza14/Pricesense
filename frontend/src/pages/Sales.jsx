import React, { useState, useEffect } from "react";
import { getSales, addSale, updateSale, deleteSale, getProducts } from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import "./Pages.css";

// ===== CHANGE: Added clearSales import =====
import { clearSales } from "../services/api";

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState({
    product_id: "",
    sale_date: "",
    price: "",
    quantity_sold: ""
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ===== CHANGE: Added clear sales dialog states =====
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Fetch sales and products
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [salesRes, productsRes] = await Promise.all([getSales(), getProducts()]);
      setSales(salesRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load sales database. Verify your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Clear alerts
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Handle open modal for create
  const handleCreateOpen = () => {
    setEditingSale(null);
    // Default to today's date in local YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      product_id: products[0]?.id || "",
      sale_date: today,
      price: products[0]?.current_price?.toString() || "",
      quantity_sold: "1"
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle product selection in form to prefill price
  const handleProductChange = (productId) => {
    const selectedProd = products.find((p) => p.id === parseInt(productId));
    setFormData((prev) => ({
      ...prev,
      product_id: productId,
      price: selectedProd ? selectedProd.current_price.toString() : prev.price
    }));
  };

  // Handle open modal for edit
  const handleEditOpen = (sale) => {
    setEditingSale(sale);
    setFormData({
      product_id: sale.product.toString(),
      sale_date: sale.sale_date,
      price: sale.price.toString(),
      quantity_sold: sale.quantity_sold.toString()
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle open confirm delete
  const handleDeleteOpen = (sale) => {
    setSaleToDelete(sale);
    setIsDeleteOpen(true);
  };

  // ===== CHANGE: Handle open clear sales confirmation =====
  const handleClearOpen = () => {
    setIsClearOpen(true);
  };

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "product_id") {
      handleProductChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const { product_id, sale_date, price, quantity_sold } = formData;
    if (!product_id) {
      setFormError("Please select a product.");
      return;
    }
    if (!sale_date) {
      setFormError("Please select a sale date.");
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError("Price must be a valid non-negative number.");
      return;
    }
    const parsedQty = parseInt(quantity_sold);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setFormError("Quantity sold must be a positive integer.");
      return;
    }

    const payload = {
      product_id: parseInt(product_id),
      sale_date,
      price: parsedPrice,
      quantity_sold: parsedQty
    };

    try {
      setSubmitting(true);
      if (editingSale) {
        // Edit flow
        const res = await updateSale(editingSale.id, payload);
        setSales((prev) =>
          prev.map((s) => (s.id === editingSale.id ? res.data : s))
        );
        setSuccessMsg(`Sales record updated successfully.`);
      } else {
        // Create flow
        const res = await addSale(payload);
        setSales((prev) => [res.data, ...prev]);
        setSuccessMsg(`New sales record created successfully.`);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setFormError(err.response.data.error);
      } else {
        setFormError("Failed to save sales record. Please check validation.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete sale action
  const handleConfirmDelete = async () => {
    if (!saleToDelete) return;
    try {
      setDeleting(true);
      await deleteSale(saleToDelete.id);
      setSales((prev) => prev.filter((s) => s.id !== saleToDelete.id));
      setSuccessMsg(`Sales record for "${saleToDelete.product_name}" removed successfully.`);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to delete sales record.");
      setIsDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  // ===== CHANGE: Handle confirm clear all sales =====
  const handleConfirmClear = async () => {
    try {
      setClearing(true);
      await clearSales();
      // Refresh data after clearing
      await fetchData();
      setSuccessMsg("All sales records cleared successfully.");
      setIsClearOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to clear sales records.");
      setIsClearOpen(false);
    } finally {
      setClearing(false);
    }
  };

  // Calculate statistics
  const totalRecords = sales.length;
  const totalRevenue = sales.reduce((acc, s) => acc + (parseFloat(s.revenue) || 0), 0);
  const totalUnits = sales.reduce((acc, s) => acc + (parseInt(s.quantity_sold) || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__left">
          <span className="page-eyebrow">PriceSense Ledger</span>
          <h1 className="page-title">Sales Records</h1>
          <p className="page-subtitle">Track transactions, sale quantities, and actual unit pricing</p>
        </div>
        {/* ===== CHANGE: Wrapped buttons in a container div for side-by-side layout ===== */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button className="btn-primary" onClick={handleCreateOpen} disabled={products.length === 0}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Record Sale
          </button>
          {/* ===== CHANGE: Added Clear Sales button ===== */}
          <button 
            className="btn-primary" 
            onClick={handleClearOpen} 
            disabled={sales.length === 0}
            style={{ background: "var(--color-danger, #dc3545)" }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear Sales
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {successMsg && <div className="alert alert--success">{successMsg}</div>}

      {products.length === 0 && !loading && (
        <div className="alert alert--error" style={{ marginBottom: "24px" }}>
          ⚠️ Please add at least one product in the Catalogue page before recording any sales.
        </div>
      )}

      <div className="data-card">
        <div className="stats-bar">
          <div className="stat-chip">
            <span className="stat-chip__label">Transactions</span>
            <span className="stat-chip__value accent">{totalRecords}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-chip">
            <span className="stat-chip__label">Units Sold</span>
            <span className="stat-chip__value">{totalUnits}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-chip">
            <span className="stat-chip__label">Total Revenue</span>
            <span className="stat-chip__value accent">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>ID</th>
              <th>Product</th>
              <th>Date</th>
              <th>Sale Price</th>
              <th>Qty</th>
              <th>Total Revenue</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="skeleton-row">
                  <td><div className="skeleton-cell" style={{ width: "40px" }}></div></td>
                  <td><div className="skeleton-cell" style={{ width: "60%" }}></div></td>
                  <td><div className="skeleton-cell" style={{ width: "80px" }}></div></td>
                  <td><div className="skeleton-cell" style={{ width: "50px" }}></div></td>
                  <td><div className="skeleton-cell" style={{ width: "30px" }}></div></td>
                  <td><div className="skeleton-cell" style={{ width: "70px" }}></div></td>
                  <td><div className="skeleton-cell" style={{ width: "80px" }}></div></td>
                </tr>
              ))
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-state__icon">
                      <svg viewBox="0 0 24 24">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <h3 className="empty-state__title">No sales logged</h3>
                    <p className="empty-state__sub">Add manual transaction records or upload a CSV report.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="td-id">#{sale.id}</td>
                  <td className="td-name">{sale.product_name}</td>
                  <td className="td-date">{sale.sale_date}</td>
                  <td className="td-price">
                    <span className="sym">₹</span>
                    {(parseFloat(sale.price) || 0).toFixed(2)}
                  </td>
                  <td className="td-qty">{sale.quantity_sold}</td>
                  <td className="td-revenue">
                    <span className="sym">₹</span>
                    {(parseFloat(sale.revenue) || 0).toFixed(2)}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn-icon btn-icon--edit"
                        onClick={() => handleEditOpen(sale)}
                        title="Edit Sale Record"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="btn-icon btn-icon--delete"
                        onClick={() => handleDeleteOpen(sale)}
                        title="Delete Sale Record"
                      >
                        <svg viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CRUD Sale Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        eyebrow={editingSale ? "Edit Mode" : "Creation Mode"}
        title={editingSale ? "Modify Transaction" : "New Sale Entry"}
        footer={
          <>
            <button className="btn-cancel" onClick={() => setIsFormOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn-submit" onClick={handleFormSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingSale ? "Save Changes" : "Log Sale"}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="modal__body" style={{ padding: 0 }}>
          {formError && <div className="form-error">{formError}</div>}
          
          <div className="form-field">
            <label className="form-label" htmlFor="sale-product">Select Product</label>
            <select
              id="sale-product"
              name="product_id"
              className="form-select"
              value={formData.product_id}
              onChange={handleChange}
              disabled={submitting || editingSale !== null}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${parseFloat(p.current_price).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="sale-date">Sale Date</label>
            <input
              id="sale-date"
              type="date"
              name="sale_date"
              className="form-input"
              value={formData.sale_date}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="sale-price">Unit Price at Sale (₹)</label>
            <input
              id="sale-price"
              type="number"
              step="0.01"
              name="price"
              className="form-input"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 89.99"
              disabled={submitting}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="sale-qty">Quantity Sold</label>
            <input
              id="sale-qty"
              type="number"
              name="quantity_sold"
              className="form-input"
              value={formData.quantity_sold}
              onChange={handleChange}
              placeholder="e.g. 5"
              disabled={submitting}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this sales transaction record?"
        itemName={saleToDelete ? `${saleToDelete.product_name} on ${saleToDelete.sale_date}` : ""}
        confirmText="Remove Record"
        isLoading={deleting}
      />

      {/* ===== CHANGE: Added Clear Sales Confirmation Dialog ===== */}
      <ConfirmDialog
        isOpen={isClearOpen}
        onClose={() => setIsClearOpen(false)}
        onConfirm={handleConfirmClear}
        title="Clear All Sales"
        message="Are you sure you want to delete ALL sales records?"
        itemName="This action cannot be undone."
        confirmText="Clear All Sales"
        isLoading={clearing}
      />
    </div>
  );
}

export default Sales;