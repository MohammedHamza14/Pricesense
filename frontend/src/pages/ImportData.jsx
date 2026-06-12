import React, { useState, useRef } from "react";
import { uploadCSV } from "../services/api";
import "./Pages.css";

function ImportData() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Only CSV files (.csv) are accepted.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== "text/csv" && !droppedFile.name.endsWith(".csv")) {
        setError("Only CSV files (.csv) are accepted.");
        setFile(null);
        return;
      }
      setFile(droppedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      setError("Please select or drop a CSV file first.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadCSV(formData);
      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Import failed. Make sure columns match and dates are valid YYYY-MM-DD.");
      }
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__left">
          <span className="page-eyebrow">PriceSense Integration</span>
          <h1 className="page-title">Bulk Import Sales Data</h1>
          <p className="page-subtitle">Upload CSV reports to bulk-populate products and transactions</p>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && (
        <div className="alert alert--success">
          ✓ Sales records and products imported successfully! Head over to the Dashboard or Ledger to view.
        </div>
      )}

      <div className="import-grid">
        {/* Left: Drag and Drop Upload Card */}
        <div className="data-card" style={{ padding: "32px 24px" }}>
          <div
            className={`upload-dropzone${dragOver ? " drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              style={{ display: "none" }}
            />
            <div className="empty-state__icon" style={{ opacity: file ? 0.9 : 0.4 }}>
              <svg viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            {file ? (
              <>
                <h3 className="empty-state__title" style={{ color: "var(--accent)" }}>
                  File Selected
                </h3>
                <p className="empty-state__sub" style={{ fontSize: "13px", color: "var(--text-bright)" }}>
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </p>
                <p className="empty-state__sub">Click or drag another file to replace</p>
              </>
            ) : (
              <>
                <h3 className="empty-state__title">Drag & Drop CSV File</h3>
                <p className="empty-state__sub">or click anywhere to browse local files</p>
              </>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "24px",
              gap: "12px"
            }}
          >
            {file && (
              <button
                className="btn-cancel"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={uploading}
              >
                Clear
              </button>
            )}
            <button
              className="btn-primary"
              onClick={handleUploadSubmit}
              disabled={!file || uploading}
              style={{ width: "auto" }}
            >
              {uploading ? "Uploading..." : "Import Data"}
            </button>
          </div>
        </div>

        {/* Right: Instructions Panel */}
        <div className="data-card import-instructions">
          <h2 className="import-instructions__title">CSV File Requirements</h2>
          
          <div className="import-step">
            <div className="import-step__num">1</div>
            <div className="import-step__text">
              <strong>Headers match exactly:</strong> The first row of your CSV file must contain the column names shown below. Order of columns does not matter.
            </div>
          </div>

          <div className="import-step">
            <div className="import-step__num">2</div>
            <div className="import-step__text">
              <strong>Date format:</strong> Ensure dates are in YYYY-MM-DD format (e.g. 2026-06-10).
            </div>
          </div>

          <div className="import-step">
            <div className="import-step__num">3</div>
            <div className="import-step__text">
              <strong>Prices and Quantities:</strong> Numbers should be clean. Do not include currency symbols ($) or commas inside values.
            </div>
          </div>

          <div className="csv-format-box">
            <div className="csv-format-box__label">Expected Columns</div>
            <div className="csv-format-box__cols">
              <span className="csv-col-tag">date</span>
              <span className="csv-col-tag">product_name</span>
              <span className="csv-col-tag">price</span>
              <span className="csv-col-tag">quantity_sold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportData;
