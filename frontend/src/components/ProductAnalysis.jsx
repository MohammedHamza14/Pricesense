import { useEffect, useState } from "react";
import axios from "axios";

/* ─── Rank medal icons ─── */
const MEDALS = ["🥇", "🥈", "🥉"];

/* ─── Sparkline-style mini bar ─── */
function RevenueBar({ pct, color }) {
  return (
    <div className="pa-bar-track">
      <div
        className="pa-bar-fill"
        style={{ width: `${pct}%`, "--bar-color": color }}
      />
    </div>
  );
}

function ProductAnalysis() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/product-analysis/")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxRevenue = Math.max(...products.map((p) => p.revenue || 0), 1);
  const maxUnits   = Math.max(...products.map((p) => p.units_sold || 0), 1);

  /* Per-rank accent colors */
  const RANK_COLORS = ["#4ade80", "#38bdf8", "#fb923c", "#c084fc", "#fbbf24"];
  const getColor = (i) => RANK_COLORS[i % RANK_COLORS.length];

  return (
    <div className="card pa-card">
      {/* ── Header ── */}
      <div className="card-header">
        <div className="card-header__left">
          <span className="card-header__eyebrow">[ DOSSIER ]</span>
          <span className="card-header__title">Product Analysis</span>
        </div>
        <span className="card-header__badge">{loading ? "—" : products.length} ITEMS</span>
      </div>

      {/* ── Table ── */}
      <div className="pa-table-wrapper">
        {loading ? (
          /* Skeleton */
          <div className="pa-skeleton">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pa-skeleton-row">
                <div className="pa-skel pa-skel--rank" />
                <div className="pa-skel pa-skel--name" />
                <div className="pa-skel pa-skel--bar" />
                <div className="pa-skel pa-skel--num" />
                <div className="pa-skel pa-skel--rev" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="pa-empty">
            <span>NO PRODUCTS ANALYSED — UPLOAD SALES DATA</span>
          </div>
        ) : (
          <table className="pa-table">
            <thead>
              <tr>
                <th className="pa-th pa-th--rank">Rank</th>
                <th className="pa-th">Product</th>
                <th className="pa-th pa-th--units">Units Sold</th>
                <th className="pa-th pa-th--right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const color       = getColor(index);
                const revPct      = ((product.revenue / maxRevenue) * 100).toFixed(1);
                const unitPct     = ((product.units_sold / maxUnits) * 100).toFixed(1);
                const revenue     = Number(product.revenue).toLocaleString("en-IN");
                const isTop       = index === 0;
                const medal       = MEDALS[index] || null;

                return (
                  <tr
                    key={index}
                    className={`pa-row${isTop ? " pa-row--top" : ""}`}
                    style={{ "--row-accent": color }}
                  >
                    {/* Rank */}
                    <td className="pa-td pa-td--rank">
                      <div
                        className="pa-rank-badge"
                        style={{ "--badge-color": color }}
                      >
                        {medal || (index + 1)}
                      </div>
                    </td>

                    {/* Product name */}
                    <td className="pa-td pa-td--name">
                      <span className="pa-product-name" style={{ "--name-glow": color }}>
                        {product.product}
                      </span>
                      {/* Revenue progress bar under name */}
                      <RevenueBar pct={revPct} color={color} />
                    </td>

                    {/* Units sold */}
                    <td className="pa-td pa-td--units">
                      <div className="pa-units-wrapper">
                        <div className="pa-units-bar-track">
                          <div
                            className="pa-units-bar-fill"
                            style={{ width: `${unitPct}%`, "--bar-color": color }}
                          />
                        </div>
                        <span className="pa-units-count">{product.units_sold}</span>
                      </div>
                    </td>

                    {/* Revenue */}
                    <td className="pa-td pa-td--rev">
                      <span className="pa-revenue" style={{ "--rev-color": color }}>
                        <span className="pa-rev-sym">₹</span>
                        {revenue}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ProductAnalysis;