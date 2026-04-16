import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ImportPage.css";

const ImportPage = () => {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // ADD THESE NEW STATE VARIABLES
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const cards = [
    { title: "Affiliates", color: "green" },
    { title: "Advertisers", color: "orange" },
    { title: "Offers", color: "blue" },
    { title: "Conversions", color: "yellow", button: "+ Setup" }
  ];

  // ADD THESE NEW FUNCTIONS
  const handleFileSelect = (event, cardTitle) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setSelectedFile({ file, cardTitle });
        setUploadStatus(null);
        console.log("File selected:", file.name, "for", cardTitle);
      } else {
        setUploadStatus({ type: 'error', message: 'Please select a valid CSV file' });
        event.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Please select a CSV file first' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', selectedFile.file);
    formData.append('type', selectedFile.cardTitle.toLowerCase());

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus({ 
          type: 'success', 
          message: `Successfully imported ${selectedFile.file.name}` 
        });
        setSelectedFile(null);
        // Clear all file inputs
        document.querySelectorAll('.csv-file-input').forEach(input => {
          input.value = '';
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({ 
        type: 'error', 
        message: 'Failed to upload file. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = (cardTitle) => {
    document.getElementById(`csv-input-${cardTitle}`).click();
  };

  return (
    <div className="of-layout">

      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="of-main">

        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="import-page">

          <div className="import-header">
            <span>Shortcuts</span>
          </div>

          <div className="import-grid">

            {cards.map((card, index) => (
              <div className="import-card" key={index}>

                <div className={`icon ${card.color}`}>☁</div>

                <h3>{card.title}</h3>

                <p>Import</p>

                {/* ADD HIDDEN FILE INPUT FOR EACH CARD */}
                <input
                  type="file"
                  id={`csv-input-${card.title}`}
                  className="csv-file-input"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e, card.title)}
                />

                {card.button ? (
                  <button className="btn setup">{card.button}</button>
                ) : (
                  <>
                    {selectedFile && selectedFile.cardTitle === card.title ? (
                      <button 
                        className="btn upload" 
                        onClick={handleUpload}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Upload CSV'}
                      </button>
                    ) : (
                      <button 
                        className="btn upload" 
                        onClick={() => triggerFileSelect(card.title)}
                      >
                        Select CSV File
                      </button>
                    )}
                  </>
                )}

                {/* ADD SELECTED FILE NAME DISPLAY */}
                {selectedFile && selectedFile.cardTitle === card.title && (
                  <div style={{ 
                    marginTop: '10px', 
                    fontSize: '12px', 
                    color: '#666',
                    textAlign: 'center'
                  }}>
                    📄 {selectedFile.file.name}
                  </div>
                )}

              </div>
            ))}

          </div>

          {/* ADD UPLOAD STATUS DISPLAY */}
          {uploadStatus && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              borderRadius: '4px',
              textAlign: 'center',
              backgroundColor: uploadStatus.type === 'success' ? '#d4edda' : '#f8d7da',
              color: uploadStatus.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${uploadStatus.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {uploadStatus.message}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ImportPage;