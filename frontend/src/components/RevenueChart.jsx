import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/* ─── Neon cyberpunk palette per bar ─── */
const BAR_COLORS = [
  { base: "#4ade80", glow: "rgba(74,222,128,0.85)",  dim: "rgba(74,222,128,0.35)"  },
  { base: "#38bdf8", glow: "rgba(56,189,248,0.85)",  dim: "rgba(56,189,248,0.35)"  },
  { base: "#fb923c", glow: "rgba(251,146,60,0.85)",  dim: "rgba(251,146,60,0.35)"  },
  { base: "#c084fc", glow: "rgba(192,132,252,0.85)", dim: "rgba(192,132,252,0.35)" },
  { base: "#f472b6", glow: "rgba(244,114,182,0.85)", dim: "rgba(244,114,182,0.35)" },
  { base: "#fbbf24", glow: "rgba(251,191,36,0.85)",  dim: "rgba(251,191,36,0.35)"  },
  { base: "#34d399", glow: "rgba(52,211,153,0.85)",  dim: "rgba(52,211,153,0.35)"  },
  { base: "#60a5fa", glow: "rgba(96,165,250,0.85)",  dim: "rgba(96,165,250,0.35)"  },
];

function getColor(index) {
  return BAR_COLORS[index % BAR_COLORS.length];
}

/* ─── Gradient factory (called inside Chart plugin) ─── */
function buildGradient(ctx, chartArea, colorObj) {
  if (!chartArea) return colorObj.glow;
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, colorObj.glow);
  gradient.addColorStop(0.5, colorObj.base + "cc");
  gradient.addColorStop(1, colorObj.dim);
  return gradient;
}

function RevenueChart() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "dark"
  );
  const chartRef = useRef(null);

  /* Track theme changes */
  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(el.getAttribute("data-theme") || "dark");
    });
    observer.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/product-analysis/")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isLight = theme === "light";

  /* Theme-aware chart colors */
  const chartColors = {
    gridX:      isLight ? "rgba(22, 163, 74, 0.07)"  : "rgba(74, 222, 128, 0.07)",
    gridY:      isLight ? "rgba(22, 163, 74, 0.09)"  : "rgba(74, 222, 128, 0.09)",
    ticks:      isLight ? "#3a5a3a"                   : "#a8c8a8",
    border:     isLight ? "rgba(22, 163, 74, 0.25)"  : "rgba(74, 222, 128, 0.25)",
    tooltipBg:  isLight ? "rgba(255, 255, 255, 0.97)" : "rgba(5, 8, 7, 0.97)",
    tooltipBdr: isLight ? "rgba(22, 163, 74, 0.4)"  : "rgba(74, 222, 128, 0.5)",
    tooltipTitle: isLight ? "#16a34a"                : "#4ade80",
    tooltipBody: isLight ? "#1a2e1a"                 : "#eaf5ea",
  };

  const labels   = products.map((p) => p.product);
  const revenues = products.map((p) => p.revenue);
  const colorMap = products.map((_, i) => getColor(i));

  const data = {
    labels,
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenues,
        /* Solid neon fill — gradients applied via afterDraw plugin below */
        backgroundColor: colorMap.map((c) => c.glow),
        borderColor:     colorMap.map((c) => c.base),
        borderWidth: 2,
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: false,
        hoverBackgroundColor: colorMap.map((c) => c.base),
        hoverBorderColor:     colorMap.map((c) => c.base),
        hoverBorderWidth: 2,
        /* Soft inner shadow on hover via borderShadowColor (Chart.js 4.x plugin) */
      },
    ],
  };

  /* ─── Gradient-fill custom plugin ─── */
  const gradientPlugin = {
    id: "gradientFill",
    beforeDraw(chart) {
      const { ctx, chartArea, data: chartData } = chart;
      if (!chartArea) return;
      const dataset = chartData.datasets[0];
      const newBg = dataset.data.map((_, i) =>
        buildGradient(ctx, chartArea, getColor(i))
      );
      dataset.backgroundColor = newBg;
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
      delay: (ctx) => ctx.dataIndex * 60,
    },
    plugins: {
      legend: { display: false },
      title:  { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: chartColors.tooltipBg,
        borderColor: chartColors.tooltipBdr,
        borderWidth: 1,
        titleColor: chartColors.tooltipTitle,
        titleFont: {
          family: "'Share Tech Mono', monospace",
          size: 11,
          weight: "normal",
        },
        titleMarginBottom: 6,
        bodyColor: chartColors.tooltipBody,
        bodyFont: {
          family: "'Rajdhani', sans-serif",
          size: 15,
          weight: "700",
        },
        padding: { top: 10, right: 16, bottom: 10, left: 16 },
        cornerRadius: 3,
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
        callbacks: {
          title: (items) => `// ${items[0].label}`,
          label: (ctx) => {
            const val = Number(ctx.parsed.y).toLocaleString("en-IN");
            return `  REVENUE  ₹${val}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: chartColors.gridX,
          lineWidth: 1,
        },
        ticks: {
          color: chartColors.ticks,
          font: {
            family: "'Rajdhani', sans-serif",
            size: 13,
            weight: "600",
          },
          maxRotation: 20,
          minRotation: 0,
          padding: 8,
        },
        border: {
          color: chartColors.border,
          width: 1,
        },
      },
      y: {
        grid: {
          color: chartColors.gridY,
          lineWidth: 1,
        },
        ticks: {
          color: chartColors.ticks,
          font: {
            family: "'Share Tech Mono', monospace",
            size: 11,
          },
          callback: (v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`,
          padding: 10,
        },
        border: {
          color: chartColors.border,
          width: 1,
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  return (
    <div className="card chart-card">
      {/* ── Header ── */}
      <div className="card-header">
        <div className="card-header__left">
          <span className="card-header__eyebrow">[ RADAR ]</span>
          <span className="card-header__title">Revenue by Product</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Mini colour legend strip */}
          {!loading && products.length > 0 && (
            <div className="chart-legend-strip">
              {products.slice(0, 4).map((p, i) => (
                <span key={p.product} className="chart-legend-dot" style={{ "--dot-color": getColor(i).base }}>
                  {p.product}
                </span>
              ))}
              {products.length > 4 && (
                <span className="chart-legend-dot" style={{ "--dot-color": "#7a9a7a" }}>
                  +{products.length - 4} more
                </span>
              )}
            </div>
          )}
          <span className="card-header__badge">LIVE FEED</span>
        </div>
      </div>

      {/* ── Chart wrapper ── */}
      <div className="chart-wrapper">
        {loading ? (
          <div className="chart-loading-state">
            <div className="chart-loading-bar">
              <div className="chart-loading-bar__fill" />
            </div>
            <span>RENDERING RADAR...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="chart-empty-state">
            <span>NO DATA AVAILABLE — UPLOAD CSV TO BEGIN</span>
          </div>
        ) : (
          <Bar ref={chartRef} data={data} options={options} plugins={[gradientPlugin]} />
        )}
      </div>
    </div>
  );
}

export default RevenueChart;