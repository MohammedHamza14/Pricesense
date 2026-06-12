import { useEffect, useState } from "react";
import axios from "axios";

function Insights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/insights/")
      .then((res) => {
        setInsights(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="insight-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card insight-card">
            <div className="insight-card__header">
              <div className="insight-card__icon" style={{ opacity: 0.3 }}>—</div>
            </div>
            <div className="insight-card__name" style={{ opacity: 0.2 }}>Loading...</div>
          </div>
        ))}
      </div>
    );
  }

  if (!insights) return null;

  const cards = [
    {
      modifier: "best",
      icon: "🏆",
      label: "Best Seller",
      name: insights.best_seller || "—",
      sub: "Highest unit volume",
    },
    {
      modifier: "worst",
      icon: "⚠",
      label: "Worst Seller",
      name: insights.worst_seller || "—",
      sub: "Lowest unit volume",
    },
    {
      modifier: "rev",
      icon: "💰",
      label: "Highest Revenue",
      name: insights.highest_revenue_product || "—",
      sub: "Top revenue generator",
    },
  ];

  return (
    <div className="insight-grid">
      {cards.map(({ modifier, icon, label, name, sub }) => (
        <div key={modifier} className={`card insight-card insight-card--${modifier}`}>
          <div className="insight-card__header">
            <div className="insight-card__icon">{icon}</div>
            <span className="insight-card__label">{label}</span>
          </div>
          <div className="insight-card__name">{name}</div>
          <div className="insight-card__sub">{sub}</div>
        </div>
      ))}
    </div>
  );
}

export default Insights;