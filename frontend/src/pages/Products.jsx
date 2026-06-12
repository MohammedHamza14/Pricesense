import React, { useState, useEffect } from "react";
import { getProducts, addProduct, updateProduct, deleteProduct, clearProducts } from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import "./Pages.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState({ name: "", current_price: "" });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

    // Clear all dialog states
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Clear alerts after a delay
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Handle open modal for create
  const handleCreateOpen = () => {
    setEditingProduct(null);
    setFormData({ name: "", current_price: "" });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle open modal for edit
  const handleEditOpen = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      current_price: product.current_price.toString()
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle open confirm delete
  const handleDeleteOpen = (product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };
    // Handle open clear all dialog
  const handleClearProductsOpen = () => {
    setIsClearAllOpen(true);
  };

  // Handle confirm clear all products
  const handleConfirmClearAll = async () => {
    try {
      setClearingAll(true);
      await clearProducts();
      await fetchProducts();
      setSuccessMsg("All products deleted successfully.");
      setIsClearAllOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to clear products.");
      setIsClearAllOpen(false);
    } finally {
      setClearingAll(false);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const name = formData.name.trim();
    const priceStr = formData.current_price.trim();

    if (!name) {
      setFormError("Product name is required.");
      return;
    }
    if (!priceStr) {
      setFormError("Current price is required.");
      return;
    }
    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      setFormError("Price must be a valid non-negative number.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingProduct) {
        // Edit flow
        const res = await updateProduct(editingProduct.id, { name, current_price: price });
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? res.data : p))
        );
        setSuccessMsg(`Product "${name}" updated successfully.`);
      } else {
        // Create flow
        const res = await addProduct({ name, current_price: price });
        setProducts((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
        setSuccessMsg(`Product "${name}" created successfully.`);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setFormError(err.response.data.error);
      } else {
        setFormError("Failed to save product. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product action
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setSuccessMsg(`Product "${productToDelete.name}" deleted successfully.`);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to delete product.");
      setIsDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  // Calculate statistics
  const totalProducts = products.length;
  const avgPrice =
    totalProducts > 0
      ? (products.reduce((acc, p) => acc + (parseFloat(p.current_price) || 0), 0) / totalProducts).toFixed(2)
      : "0.00";

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__left">
          <span className="page-eyebrow">PriceSense Data</span>
          <h1 className="page-title">Products Catalogue</h1>
          <p className="page-subtitle">Manage inventory items and their default prices</p>
        </div>
                <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-primary" onClick={handleCreateOpen}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>
          <button className="btn-danger" onClick={handleClearProductsOpen}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear Products
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {successMsg && <div className="alert alert--success">{successMsg}</div>}

      <div className="data-card">
        <div className="stats-bar">
          <div className="stat-chip">
            <span className="stat-chip__label">Total Products</span>
            <span className="stat-chip__value accent">{totalProducts}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-chip">
            <span className="stat-chip__label">Avg Base Price</span>
            <span className="stat-chip__value">₹{avgPrice}</span>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>ID</th>
              <th>Product Name</th>
              <th>Base Price</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton screens
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="skeleton-row">
                  <td><div className="skeleton-cell" style={{ width: "40px" }}></div></td>
                  <td><div className="skeleton-cell" style={{ width: "70%" }}></div></td>
                  <td><div className="skeleton-cell" style={{ width: "60px" }}></div></td>
                  <td><div className="skeleton-cell" style={{ width: "80px" }}></div></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <div className="empty-state">
                    <div className="empty-state__icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </div>
                    <h3 className="empty-state__title">No products found</h3>
                    <p className="empty-state__sub">Create a new product or upload a CSV file to begin.</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="td-id">#{product.id}</td>
                  <td className="td-name">{product.name}</td>
                  <td className="td-price">
                    <span className="sym">₹</span>
                    {(parseFloat(product.current_price) || 0).toFixed(2)}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn-icon btn-icon--edit"
                        onClick={() => handleEditOpen(product)}
                        title="Edit Product"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="btn-icon btn-icon--delete"
                        onClick={() => handleDeleteOpen(product)}
                        title="Delete Product"
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

      {/* CRUD Product Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        eyebrow={editingProduct ? "Edit Mode" : "Creation Mode"}
        title={editingProduct ? "Modify Product" : "New Product Entry"}
        footer={
          <>
            <button className="btn-cancel" onClick={() => setIsFormOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn-submit" onClick={handleFormSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="modal__body" style={{ padding: 0 }}>
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-field">
            <label className="form-label" htmlFor="product-name">Product Name</label>
            <input
              id="product-name"
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Premium Wireless Earbuds"
              autoFocus
              disabled={submitting}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="product-price">Base Price (₹)</label>
            <input
              id="product-price"
              type="number"
              step="0.01"
              name="current_price"
              className="form-input"
              value={formData.current_price}
              onChange={handleChange}
              placeholder="e.g. 99.99"
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
        title="Remove Product"
        message="Are you sure you want to permanently delete this product? All historical sales records associated with this product will also be deleted."
        itemName={productToDelete?.name}
        confirmText="Remove Product"
        isLoading={deleting}
      />

      {/* Clear All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={handleConfirmClearAll}
        title="Clear All Products"
        message="Are you sure you want to delete ALL products? This action cannot be undone."
        confirmText="Clear All Products"
        isLoading={clearingAll}
      />
    </div>
  );
}

export default Products;
