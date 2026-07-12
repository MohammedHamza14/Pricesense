import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Insights from "../components/Insights";
import RevenueChart from "../components/RevenueChart";
import Recommendations from "../components/Recommendations";
import ProductAnalysis from "../components/ProductAnalysis";
import "./Dashboard.css";

/* ── SVG Icons ── */
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconActivity = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconRevenue = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12M15 9H9a2 2 0 000 4h6a2 2 0 010 4H9" />
  </svg>
);

/* ── Section Label ── */
function SectionLabel({ tag, title }) {
  return (
    <div className="section-label">
      <span className="section-label__tag">{tag}</span>
      <span className="section-label__title">{title}</span>
      <span className="section-label__line" />
    </div>
  );
}

/* ── KPI Card ── */
function KpiCard({ icon, label, title, value, badge, dotClass, statusText }) {
  return (
    <div className="card kpi-card">
      <div className="kpi-card__top">
        <div className="kpi-card__icon">{icon}</div>
        <span className="kpi-card__badge">{badge}</span>
      </div>
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__title">{title}</div>
      <div className="kpi-card__value">{value}</div>
      <div className="kpi-card__footer">
        <span className={`status-dot ${dotClass}`} />
        <span className="status-text">{statusText}</span>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predictionData, setPredictionData] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(true);
  const [predictionError, setPredictionError] = useState(false);
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessSubmitted, setBusinessSubmitted] = useState(false);
  const [externalConfidence, setExternalConfidence] = useState(null);
  const [confidenceLoading, setConfidenceLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/dashboard/")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Mission failed:", err);
        setLoading(false);
      });
  }, []);
  useEffect(() => {
  axios
    .get("http://127.0.0.1:8000/api/predictions/")
    .then((res) => {
      setPredictionData(res.data);
      setPredictionLoading(false);
    })
    .catch((err) => {
      console.error("AI Forecast failed:", err);
      setPredictionError(true);
      setPredictionLoading(false);
    });
}, []);

useEffect(() => {
  if (!businessDescription.trim()) {
    setExternalConfidence(null);
    return;
  }

  setConfidenceLoading(true);

  axios
    .get(`http://127.0.0.1:8000/api/predictions/with-confidence/?business_description=${encodeURIComponent(businessDescription)}`)
    .then((res) => {
      setExternalConfidence(res.data.external_confidence);
      setConfidenceLoading(false);
    })
    .catch((err) => {
      console.error("External confidence failed:", err);
      setExternalConfidence(null);
      setConfidenceLoading(false);
    });
}, [businessSubmitted]);

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="fullscreen-state">
        <div className="loading-box">
          <div className="loading-box__crosshair">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" strokeWidth="1" strokeDasharray="6 4" />
              <circle cx="32" cy="32" r="18" strokeWidth="1.5" strokeDasharray="4 6" />
              <line x1="32" y1="4"  x2="32" y2="16" strokeWidth="1.5" />
              <line x1="32" y1="48" x2="32" y2="60" strokeWidth="1.5" />
              <line x1="4"  y1="32" x2="16" y2="32" strokeWidth="1.5" />
              <line x1="48" y1="32" x2="60" y2="32" strokeWidth="1.5" />
              <circle cx="32" cy="32" r="3" fill="currentColor" />
            </svg>
          </div>
          <div className="loading-box__label">Initializing</div>
          <div className="loading-box__dots">
            <span /><span /><span />
          </div>
          <div className="loading-box__bar">
            <div className="loading-box__bar-fill" />
          </div>
          <div className="loading-box__sub">Accessing Command Center</div>
        </div>
      </div>
    );
  }

  /* ── Error screen ── */
  if (!data) {
    return (
      <div className="fullscreen-state">
        <div className="error-box">
          <div className="error-box__icon">⚠️</div>
          <div className="error-box__title">// Connection Lost</div>
          <div className="error-box__msg">Unable to establish tactical link</div>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            ⚡ Reconnect
          </button>
        </div>
      </div>
    );
  }

  const formattedRevenue = data.total_revenue
    ? Number(data.total_revenue).toLocaleString("en-IN")
    : "0";

  return (
    <div className="dashboard">

      {/* ── MISSION HEADER ── */}
      <header className="mission-header">
        <span className="mission-eyebrow">// MISSION BRIEFING</span>
        <h1 className="mission-title">
          Price<span className="highlight">Sense</span> Command
        </h1>
        <p className="mission-subtitle">
          Tactical Intelligence Dashboard
        </p>
      </header>

            {/* ── SECTION: BUSINESS CONTEXT ── */}
      <section className="section">
        <SectionLabel tag="[ CONTEXT ]" title="Business Description" />
        <div className="card business-context-card">
          <p className="business-context-card__help">
            Describe your business to get context-aware confidence scores. 
            News headlines will be analyzed for relevance to your business.
          </p>
          <input
            type="text"
            className="business-context-input"
            placeholder="e.g., We are a textile export company dealing in cotton garments..."
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && businessDescription.trim()) {
                e.target.blur();
                setBusinessSubmitted(true);
              }
            }}
          />
          {businessSubmitted && (
            <div className="business-context-success">
              ✓ Context accepted
            </div>
          )}
        </div>
      </section>  
      
      {/* ── EXTERNAL CONFIDENCE (NEW) ── */}
      {businessSubmitted && (
        <div className="card ai-forecast-card ai-forecast-card--confidence">
          <div className="ai-forecast-card__header">
            <span className="ai-forecast-card__icon">🌐</span>
            <span className="ai-forecast-card__title">External Confidence</span>
          </div>
          
          {confidenceLoading ? (
            <div className="ai-forecast-card__loader">
              <span className="ai-forecast-card__loader-text">Analyzing news headlines...</span>
            </div>
          ) : externalConfidence ? (
            <>
              <div className={`confidence-badge confidence-badge--${
                externalConfidence.confidence >= 75 ? 'high' :
                externalConfidence.confidence >= 50 ? 'moderate' :
                externalConfidence.confidence >= 25 ? 'low' : 'very-low'
              }`}>
                <span className="confidence-badge__score">{externalConfidence.confidence}%</span>
                <span className="confidence-badge__label">{externalConfidence.interpretation}</span>
              </div>
              
              <div className="confidence-details">
                <div className="confidence-details__item">
                  <span className="confidence-details__label">Relevant Headlines</span>
                  <span className="confidence-details__value">{externalConfidence.relevant_headlines_used} of {externalConfidence.total_headlines}</span>
                </div>
                <div className="confidence-details__item">
                  <span className="confidence-details__label">Avg Sentiment</span>
                  <span className={`confidence-details__value ${
                    externalConfidence.avg_sentiment > 0.1 ? 'confidence-details__value--positive' :
                    externalConfidence.avg_sentiment < -0.1 ? 'confidence-details__value--negative' : ''
                  }`}>
                    {externalConfidence.avg_sentiment > 0 ? '+' : ''}{externalConfidence.avg_sentiment.toFixed(2)}
                  </span>
                </div>
              </div>
              
              {externalConfidence.warning && (
                <div className="confidence-warning">
                  ⚠️ {externalConfidence.warning}
                </div>
              )}
            </>
          ) : (
            <p className="ai-forecast-card__message">
              Unable to calculate external confidence.
            </p>
          )}
        </div>
      )}

      {/* ── SECTION 1: KPI CARDS ── */}
      <section className="section">
        <SectionLabel tag="[ INTEL ]" title="Field Report" />
        <div className="kpi-grid">
          <div
            onClick={() => navigate("/products")}
            style={{ cursor: "pointer" }}
          >
            <KpiCard
              icon={<IconGrid />}
              label="SUPPLIES"
              title="Products"
              value={data.total_products}
              badge="CATALOG"
              dotClass="status-dot--green"
              statusText="ACTIVE"
            />
          </div>
          <div
            onClick={() => navigate("/sales")}
            style={{ cursor: "pointer" }}
          >
            <KpiCard
              icon={<IconActivity />}
              label="OPS LOG"
              title="Sales Records"
              value={data.total_sales_records}
              badge="LIVE"
              dotClass="status-dot--blue"
              statusText="TRACKING"
            />
          </div>
          <KpiCard
            icon={<IconRevenue />}
            label="RESOURCES"
            title="Revenue"
            value={
              <span>
                <span className="currency-symbol">₹</span>
                {formattedRevenue}
              </span>
            }
            badge="CLASSIFIED"
            dotClass="status-dot--yellow"
            statusText="CLASSIFIED"
          />
        </div>
      </section>
     
                  {/* ── SECTION: AI FORECAST ── */}
      <section className="section">
        <SectionLabel tag="[ AI CORE ]" title="Sales Forecast" />
        
        {predictionLoading ? (
          <div className="card ai-forecast-card ai-forecast-card--loading">
            <div className="ai-forecast-card__header">
              <span className="ai-forecast-card__icon">🤖</span>
              <span className="ai-forecast-card__title">Neural Processing</span>
            </div>
            <div className="ai-forecast-card__loader">
              <div className="ai-pulse-ring">
                <div className="ai-pulse-ring__inner" />
                <div className="ai-pulse-ring__outer" />
              </div>
              <span className="ai-forecast-card__loader-text">Analyzing product patterns...</span>
            </div>
          </div>
        ) : predictionError || !predictionData?.ai_enabled ? (
          <div className="card ai-forecast-card ai-forecast-card--error">
            <div className="ai-forecast-card__header">
              <span className="ai-forecast-card__icon">⚠️</span>
              <span className="ai-forecast-card__title">AI Forecast Unavailable</span>
            </div>
            <p className="ai-forecast-card__message">
              {predictionData?.message || "Unable to process prediction. Insufficient data or connection error."}
            </p>
            {predictionData?.product_predictions?.some(p => !p.ai_enabled) && (
              <div className="ai-forecast-card__insufficient-products">
                {predictionData.product_predictions
                  .filter(p => !p.ai_enabled)
                  .map((p, idx) => (
                    <div key={idx} className="ai-forecast-card__insufficient-item">
                      <span className="ai-forecast-card__insufficient-product">{p.product}</span>
                      <span className="ai-forecast-card__insufficient-msg">{p.message}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : businessSubmitted ? (
          <div className="ai-forecast-products">
            <div className="ai-forecast-summary">
              <span className="ai-forecast-summary__icon">🎯</span>
              <span className="ai-forecast-summary__text">
                Analyzing {predictionData.total_products_analyzed} of {predictionData.total_products_in_database} products
              </span>
            </div>
            
            {predictionData.product_predictions
              .filter(p => p.ai_enabled)
              .map((product, index) => (
                <div key={index} className="card ai-forecast-card ai-forecast-card--product">
                  <div className="ai-forecast-card__header">
                    <span className="ai-forecast-card__icon">📦</span>
                    <span className="ai-forecast-card__title">{product.product}</span>
                    <span className={`ai-forecast-card__trend-badge ai-forecast-card__trend--${product.trend}`}>
                      {product.trend === "increasing" ? "📈" : product.trend === "decreasing" ? "📉" : "📊"}{" "}
                      {product.trend.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="ai-forecast-card__grid">
                    <div className="ai-forecast-card__metric">
                      <div className="ai-forecast-card__metric-label">Next Day</div>
                      <div className="ai-forecast-card__metric-value">
                        {product.predicted_next_day_sales}
                      </div>
                      <div className="ai-forecast-card__metric-unit">units</div>
                    </div>
                    
                    <div className="ai-forecast-card__metric">
                      <div className="ai-forecast-card__metric-label">Next Week</div>
                      <div className="ai-forecast-card__metric-value">
                        {product.predicted_next_week_sales}
                      </div>
                      <div className="ai-forecast-card__metric-unit">units</div>
                    </div>
                    
                    <div className="ai-forecast-card__metric">
                      <div className="ai-forecast-card__metric-label">Confidence</div>
                      <div className="ai-forecast-card__metric-value ai-forecast-card__metric-value--small">
                        {product.additional_insights?.prediction_confidence?.toUpperCase() || "N/A"}
                      </div>
                      <div className="ai-forecast-card__metric-unit">level</div>
                    </div>
                    
                    <div className="ai-forecast-card__metric">
                      <div className="ai-forecast-card__metric-label">Model R²</div>
                      <div className="ai-forecast-card__metric-value ai-forecast-card__metric-value--small">
                        {product.additional_insights?.model_accuracy_r2_score 
                          ? `${(product.additional_insights.model_accuracy_r2_score * 100).toFixed(1)}%` 
                          : "N/A"}
                      </div>
                      <div className="ai-forecast-card__metric-unit">accuracy</div>
                    </div>
                  </div>
                  
                  <div className="ai-forecast-card__footer">
                    <span className="ai-forecast-card__footer-dot" />
                    <span>Based on {product.total_records_used} records over {product.additional_insights?.total_unique_days || 0} days</span>
                    <span className="ai-forecast-card__avg">
                      Avg: {product.additional_insights?.average_daily_sales || 0} units/day
                    </span>
                  </div>
                </div>
              ))}
            
            {predictionData.product_predictions?.some(p => !p.ai_enabled) && (
              <div className="card ai-forecast-card ai-forecast-card--insufficient">
                <div className="ai-forecast-card__header">
                  <span className="ai-forecast-card__icon">⏳</span>
                  <span className="ai-forecast-card__title">Insufficient Data</span>
                </div>
                <div className="ai-forecast-card__insufficient-list">
                  {predictionData.product_predictions
                    .filter(p => !p.ai_enabled)
                    .map((p, idx) => (
                      <div key={idx} className="ai-forecast-card__insufficient-item">
                        <span className="ai-forecast-card__insufficient-product">{p.product}</span>
                        <span className="ai-forecast-card__insufficient-msg">
                          {p.message || "Not enough data"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card ai-forecast-card ai-forecast-card--waiting">
            <div className="ai-forecast-card__header">
              <span className="ai-forecast-card__icon">🔒</span>
              <span className="ai-forecast-card__title">Awaiting Context</span>
            </div>
            <p className="ai-forecast-card__message">
              Enter your business description above and press ENTER to unlock predictions.
            </p>
          </div>
        )}
      </section>
              
      {/* ── SECTION 2: INSIGHT CARDS ── */}
      <section className="section">
        <SectionLabel tag="[ ANALYTICS ]" title="Business Insights" />
        <Insights />
      </section>

      {/* ── SECTION 3: REVENUE CHART ── */}
      <section className="section">
        <SectionLabel tag="[ RADAR ]" title="Revenue Chart" />
        <RevenueChart />
      </section>

      {/* ── SECTION 4: RECOMMENDATIONS ── */}
      <section className="section">
        <SectionLabel tag="[ ORDERS ]" title="Recommendations" />
        <Recommendations />
      </section>

      {/* ── SECTION 5: PRODUCT ANALYSIS ── */}
      <section className="section">
        <SectionLabel tag="[ DOSSIER ]" title="Product Analysis" />
        <ProductAnalysis />
      </section>

    </div>
  );
}

export default Dashboard;