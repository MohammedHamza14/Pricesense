import React, { useState, useEffect } from "react";
import { getProducts, addSale } from "../services/api";
import "./Pages.css";

function Billing() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    }
  };

  // Clear alerts
  useEffect(() => {
    if (successMsg || error) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, error]);

  // Add to cart
  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.current_price,
          quantity: 1,
        },
      ]);
    }
  };

  // Update quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.18; // 18% GST (adjust as needed)
  const total = subtotal + tax;

  // Process checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Cart is empty!");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Create sale records for each item in cart
      const salePromises = cart.map((item) =>
        addSale({
          product_id: item.id,
          sale_date: today,
          price: item.price,
          quantity_sold: item.quantity,
        })
      );

      await Promise.all(salePromises);

      setSuccessMsg(`✅ Sale completed! Total: ₹${total.toFixed(2)}`);
      clearCart();
      
      // Auto-refresh products to update stock (if you implement stock tracking)
      await fetchProducts();
      
    } catch (err) {
      console.error(err);
      setError("Failed to process sale. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["all", ...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__left">
          <span className="page-eyebrow">POINT OF SALE</span>
          <h1 className="page-title">Billing Terminal</h1>
          <p className="page-subtitle">Fast checkout with automatic inventory updates</p>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {successMsg && <div className="alert alert--success">{successMsg}</div>}

      <div className="billing-container">
        {/* Left: Product Grid */}
        <div className="billing-products">
          {/* Search & Filter */}
          <div className="billing-filters">
            <input
              type="text"
              placeholder="Search products..."
              className="billing-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="billing-filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Product Grid */}
          <div className="product-grid">
            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <p>No products found</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => addToCart(product)}
                >
                  <h3 className="product-card__name">{product.name}</h3>
                  <p className="product-card__category">{product.category}</p>
                  <p className="product-card__price">₹{product.current_price.toFixed(2)}</p>
                  <button className="product-card__btn">Add to Cart</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="billing-cart">
          <div className="cart-header">
            <h2>CURRENT SALE</h2>
            <button className="btn-clear-cart" onClick={clearCart} disabled={cart.length === 0}>
              Clear
            </button>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <p>Cart is empty</p>
                <p className="cart-empty__sub">Click products to add</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item__info">
                    <h4>{item.name}</h4>
                    <p className="cart-item__price">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="cart-item__controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="cart-item__total">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (18%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="summary-row summary-row--total">
              <span>TOTAL:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
          >
            {processing ? "Processing..." : "COMPLETE SALE"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Billing;