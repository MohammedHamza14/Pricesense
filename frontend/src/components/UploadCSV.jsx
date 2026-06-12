import { useState } from "react";
import axios from "axios";

const IconUpload = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

function UploadCSV() {
  const [file, setFile]       = useState(null);
  const [status, setStatus]   = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setStatus(null);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("error");
      setMessage("No file selected");
      return;
    }

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/upload-csv/",
        formData
      );
      setStatus("success");
      setMessage(response.data.message || "Data deployed successfully");
      setTimeout(() => window.location.reload(), 1400);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Upload failed — check file format");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card upload-module">

      {/* Left: icon + meta */}
      <div className="upload-module__left">
        <div className="upload-icon">
          <IconUpload />
        </div>
        <div className="upload-module__meta">
          <span className="upload-title">Deploy CSV Data</span>
          <span className="upload-hint">
            {file
              ? <><IconFile />&nbsp;&nbsp;{file.name}</>
              : "No file selected — .csv format required"
            }
          </span>
        </div>
      </div>

      {/* Right: controls + status */}
      <div className="upload-module__controls">
        {status && (
          <div className={`upload-status upload-status--${status}`}>
            <span>{status === "success" ? "✓" : "✗"}</span>
            <span>{message}</span>
          </div>
        )}

        <label className="file-picker-label">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
          ⊞ Select File
        </label>

        <button
          className={`upload-btn${loading ? " upload-btn--loading" : ""}`}
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "⟳ Deploying..." : "⚡ Deploy"}
        </button>
      </div>

    </div>
  );
}

export default UploadCSV;