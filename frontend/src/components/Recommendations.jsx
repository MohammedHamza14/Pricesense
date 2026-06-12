import { useEffect, useState } from "react";
import axios from "axios";

function Recommendations() {
  const [recs, setRecs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/recommendations/")
      .then((res) => {
        /* Support both array response and object with a key */
        const data = res.data;
        if (Array.isArray(data)) {
          setRecs(data);
        } else if (data.recommendations && Array.isArray(data.recommendations)) {
          setRecs(data.recommendations);
        } else {
          setRecs([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setRecs([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="card reco-card">
      <div className="card-header">
        <div className="card-header__left">
          <span className="card-header__eyebrow">[ ORDERS ]</span>
          <span className="card-header__title">Recommendations</span>
        </div>
        {!loading && recs.length > 0 && (
          <span className="card-header__badge">{recs.length} DIRECTIVES</span>
        )}
      </div>

      <div className="reco-grid">
        {loading ? (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "11px",
            letterSpacing: "4px", color: "var(--text-muted)",
            textAlign: "center", padding: "40px",
          }}>
            GENERATING DIRECTIVES...
          </div>
        ) : recs.length === 0 ? (
          <div className="reco-empty">No directives available</div>
        ) : (
          recs.map((rec, i) => (
            <div key={i} className="reco-item">
              <span className="reco-item__index">
                {String(i + 1).padStart(2, "0")}.
              </span>
              <span className="reco-item__text">
                {typeof rec === "string" ? rec : rec.text || JSON.stringify(rec)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Recommendations;
