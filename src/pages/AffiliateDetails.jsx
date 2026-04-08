import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/AffiliateDetails.css";
import { useParams, useNavigate } from "react-router-dom";

const AffiliateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [affiliates, setAffiliates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [countries, setCountries] = useState([]);
  const [managers, setManagers] = useState([]);
  const [socialContactTypes, setSocialContactTypes] = useState([
    "Facebook", "Twitter", "LinkedIn", "Instagram", "Skype", "Telegram", "WhatsApp", "WeChat", "Other"
  ]);

  // State for action buttons highlight
  const [activeAction, setActiveAction] = useState(null);

  // State for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sample data for charts
  const [chartData] = useState({
    revenue: [850, 1250, 1890, 2340, 2780, 3250, 4120, 3890, 4560, 5230, 4980, 5670],
    clicks: [1250, 1890, 2450, 2980, 3450, 4120, 4890, 5230, 5670, 6120, 5890, 6340],
    conversions: [28, 45, 67, 89, 112, 138, 156, 178, 189, 201, 195, 212],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  });

  // Function to get status badge class
  const getStatusClass = (status) => {
    if (!status) return 'status-badge';

    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'status-badge status-active';
    if (statusLower === 'inactive') return 'status-badge status-inactive';
    if (statusLower === 'rejected') return 'status-badge status-rejected';
    if (statusLower === 'pending') return 'status-badge status-pending';
    if (statusLower === 'approved') return 'status-badge status-approved';
    if (statusLower === 'suspended') return 'status-badge status-suspended';
    return 'status-badge';
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    if (!status) return null;

    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return '✅';
    if (statusLower === 'inactive') return '⭕';
    if (statusLower === 'rejected') return '❌';
    if (statusLower === 'pending') return '⏳';
    if (statusLower === 'approved') return '✓';
    if (statusLower === 'suspended') return '⚠️';
    return null;
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'n/a';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Format date only (no time)
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'n/a';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get sign in sessions display
  const getSignInSessions = () => {
    if (!selected?.lastLogin) return "Never Logged in";
    return "Logged in";
  };

  // 🌍 Countries
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => res.json())
      .then((data) => {
        const list = data.map((c) => c.name.common).sort();
        setCountries(list);
      })
      .catch((err) => console.error("Error fetching countries:", err));
  }, []);

  // Mock managers list - replace with your API
  useEffect(() => {
    setManagers([
      "John Smith",
      "Sarah Johnson",
      "Michael Brown",
      "Emily Davis",
      "David Wilson"
    ]);
  }, []);

  // 🔹 Get affiliates list for dropdown
  useEffect(() => {
    fetch("https://localhost:7029/api/Affiliates")
      .then((res) => res.json())
      .then((data) => setAffiliates(data))
      .catch((err) => console.error("Error fetching affiliates list:", err));
  }, []);

  // 🔹 Fetch single affiliate
  const fetchAffiliate = (id) => {
    if (!id) return;

    setLoading(true);

    fetch(`https://localhost:7029/api/Affiliates/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched affiliate data:", data);
        setSelected(data);
        setFormData(data);
        setIsEdit(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching affiliate:", err);
        alert(`Failed to load affiliate: ${err.message}`);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) fetchAffiliate(id);
  }, [id]);

  const handleSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      navigate(`/affiliate/${selectedId}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle switch toggle for boolean fields
  const handleSwitchChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://localhost:7029/api/Affiliates/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedData = await response.json();
      alert("Updated successfully ✅");
      setSelected(updatedData);
      setFormData(updatedData);
      setIsEdit(false);
    } catch (err) {
      console.error("Error updating affiliate:", err);
      alert(`Update failed: ${err.message} ❌`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(selected);
    setIsEdit(false);
  };

  // Action handlers
  const handleActionClick = (action) => {
    setActiveAction(action);
    console.log(`Clicked: ${action}`);
    if (action === 'login') {
      alert(`Login as ${selected?.firstName} ${selected?.lastName}`);
    } else if (action === 'offers') {
      alert('View applied offers');
    } else if (action === 'reports') {
      alert('View reports');
    } else if (action === 'invoice') {
      alert('View invoice');
    } else if (action === 'email') {
      alert('Send email');
    } else if (action === 'affiliatesTrackingURL') {
      alert('Affiliates Tracking URL');
    } else if (action === 'password') {
      alert('Reset password');
    }
    setTimeout(() => setActiveAction(null), 300);
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Calculate max values for chart scaling
  const maxRevenue = Math.max(...chartData.revenue);
  const maxClicks = Math.max(...chartData.clicks);

  // Get current year
  const currentYear = new Date().getFullYear();

  // Calculate totals
  const totalRevenue = chartData.revenue.reduce((a, b) => a + b, 0);
  const totalClicks = chartData.clicks.reduce((a, b) => a + b, 0);
  const totalConversions = chartData.conversions.reduce((a, b) => a + b, 0);
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0;
  const epc = totalClicks > 0 ? (totalRevenue / totalClicks).toFixed(2) : 0;

  // Get full name
  const getFullName = () => {
    if (!selected) return '';
    const firstName = selected.firstName || '';
    const lastName = selected.lastName || '';
    return `${firstName} ${lastName}`.trim();
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!selected) return 'NA';
    const firstName = selected.firstName || '';
    const lastName = selected.lastName || '';
    return `${firstName.charAt(0)?.toUpperCase() || ''}${lastName.charAt(0)?.toUpperCase() || ''}`.trim() || 'NA';
  };

  return (
    <div className="main-container">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      <div className={`content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header onMenuClick={toggleSidebar} />

        <div className="page-wrapper">

          {/* LEFT PANEL */}
          <div className="left-panel">
            <div className="card">

              {/* HEADER */}
              <div className="profile-header">
                <div className="avatar">
                  {getInitials()}
                </div>

                <div style={{ width: "100%" }}>
                  <div className="profile-header-top">
                    <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                      Affiliate : #{selected?.id}
                    </p>

                    {selected && (
                      <button className="edit-btn" onClick={() => setIsEdit(!isEdit)}>
                        {isEdit ? "Cancel" : "Edit"}
                      </button>
                    )}
                  </div>

                  <h3>{getFullName() || 'N/A'}</h3>
                  <p className="sub-text">
                    {selected?.company || selected?.jobTitle || 'Individual Affiliate'}
                  </p>
                  <span className={getStatusClass(selected?.status)}>
                    {getStatusIcon(selected?.status)} {selected?.status || 'N/A'}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS SET */}
              <div className="action-buttons-set">
                <button
                  className={`action-btn ${activeAction === 'login' ? 'active' : ''}`}
                  onClick={() => handleActionClick('login')}
                >
                  🔑 Login as Affiliate
                </button>
                <button
                  className={`action-btn ${activeAction === 'offers' ? 'active' : ''}`}
                  onClick={() => handleActionClick('offers')}
                >
                  📦 Offers
                </button>
                <button
                  className={`action-btn ${activeAction === 'reports' ? 'active' : ''}`}
                  onClick={() => handleActionClick('reports')}
                >
                  📊 Reports
                </button>
                <button
                  className={`action-btn ${activeAction === 'invoice' ? 'active' : ''}`}
                  onClick={() => handleActionClick('invoice')}
                >
                  💰 Invoice
                </button>
                <button
                  className={`action-btn ${activeAction === 'email' ? 'active' : ''}`}
                  onClick={() => handleActionClick('email')}
                >
                  ✉️ Email
                </button>
                <button
                  className={`action-btn ${activeAction === 'affiliatesTrackingURL' ? 'active' : ''}`}
                  onClick={() => handleActionClick('affiliatesTrackingURL')}
                >
                  📍 Affiliates Tracking URL
                </button>
                <button
                  className={`action-btn ${activeAction === 'password' ? 'active' : ''}`}
                  onClick={() => handleActionClick('password')}
                >
                  🔐 Password Reset
                </button>
              </div>

              {/* PROFILE SECTION - ALL FIELDS FROM SCREENSHOT */}
              <div className="info-section">
                <h4>Profile</h4>
                <div className="info-grid">
                  <div className="info-row">
                    <label>First Name *</label>
                    {isEdit ?
                      <input name="firstName" value={formData?.firstName || ""} onChange={handleChange} /> :
                      <span>{selected?.firstName || 'n/a'}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Last Name</label>
                    {isEdit ?
                      <input name="lastName" value={formData?.lastName || ""} onChange={handleChange} /> :
                      <span>{selected?.lastName || 'n/a'}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Company</label>
                    {isEdit ?
                      <input name="company" value={formData?.company || ""} onChange={handleChange} /> :
                      <span>{selected?.company || 'n/a'}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Mobile Number</label>
                    {isEdit ?
                      <input name="mobileNumber" value={formData?.mobileNumber || formData?.contact || ""} onChange={handleChange} /> :
                      <span>{selected?.mobileNumber || selected?.contact || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Address</label>
                    {isEdit ?
                      <input name="address" value={formData?.address || ""} onChange={handleChange} /> :
                      <span>{selected?.address || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>City</label>
                    {isEdit ?
                      <input name="city" value={formData?.city || ""} onChange={handleChange} /> :
                      <span>{selected?.city || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>State</label>
                    {isEdit ?
                      <input name="state" value={formData?.state || ""} onChange={handleChange} /> :
                      <span>{selected?.state || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Country</label>
                    {isEdit ? (
                      <select name="country" value={formData?.country || ""} onChange={handleChange}>
                        <option value="">Select Country</option>
                        {countries.map((c, i) => <option key={i}>{c}</option>)}
                      </select>
                    ) : <span>{selected?.country || "n/a"}</span>}
                  </div>
                  <div className="info-row">
                    <label>Zip Code</label>
                    {isEdit ?
                      <input name="zipCode" value={formData?.zipCode || ""} onChange={handleChange} /> :
                      <span>{selected?.zipCode || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Social Contact Type</label>
                    {isEdit ? (
                      <select name="socialContactType" value={formData?.socialContactType || ""} onChange={handleChange}>
                        <option value="">Select Type</option>
                        {socialContactTypes.map((type, i) => <option key={i}>{type}</option>)}
                      </select>
                    ) : <span>{selected?.socialContactType || "n/a"}</span>}
                  </div>
                  <div className="info-row">
                    <label>Social Contact</label>
                    {isEdit ?
                      <input name="socialContact" value={formData?.socialContact || ""} onChange={handleChange} /> :
                      <span>{selected?.socialContact || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Traffic Sources</label>
                    {isEdit ?
                      <textarea name="trafficSources" value={formData?.trafficSources || ""} onChange={handleChange} /> :
                      <span>{selected?.trafficSources || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>External Id</label>
                    {isEdit ?
                      <input name="externalID" value={formData?.externalID || ""} onChange={handleChange} /> :
                      <span>{selected?.externalID || "n/a"}</span>
                    }
                  </div>
                </div>
              </div>

              {/* ACCOUNT SECTION - WITH ALL SCREENSHOT FIELDS */}
              <div className="info-section">
                <h4>Account</h4>
                <div className="info-grid">
                  <div className="info-row">
                    <label>Email *</label>
                    {isEdit ?
                      <input name="email" value={formData?.email || ""} onChange={handleChange} /> :
                      <span>{selected?.email || 'n/a'}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Manager</label>
                    {isEdit ? (
                      <select name="manager" value={formData?.manager || ""} onChange={handleChange}>
                        <option value="">Select Employee</option>
                        {managers.map((m, i) => <option key={i}>{m}</option>)}
                      </select>
                    ) : <span>{selected?.manager || "n/a"}</span>}
                  </div>
                  <div className="info-row">
                    <label>Post Delay</label>
                    {isEdit ?
                      <input name="postbackDelay" type="number" value={formData?.postbackDelay || 0} onChange={handleChange} /> :
                      <span>{selected?.postbackDelay ?? "0"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Timezone</label>
                    {isEdit ?
                      <input name="timeZone" value={formData?.timeZone || ""} onChange={handleChange} /> :
                      <span>{selected?.timeZone || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Affiliate Fallback</label>
                    {isEdit ?
                      <input name="fallBackURL" value={formData?.fallBackURL || ""} onChange={handleChange} /> :
                      <span>{selected?.fallBackURL || "http://example.com/"}</span>
                    }
                  </div>
                  
                  {/* Allow Profile Update - Switch Button */}
                  <div className="info-row">
                    <label>Allow Profile Update</label>
                    {isEdit ? (
                      <label className="switch-label">
                        <input
                          type="checkbox"
                          className="switch-input"
                          checked={formData?.allowProfileUpdate || false}
                          onChange={(e) => handleSwitchChange('allowProfileUpdate', e.target.checked)}
                        />
                        <span className="switch-slider"></span>
                        <span className="switch-text">
                          {formData?.allowProfileUpdate ? "Active" : "Inactive"}
                        </span>
                      </label>
                    ) : (
                      <span className={formData?.allowProfileUpdate ? "active-text" : "inactive-text"}>
                        {formData?.allowProfileUpdate ? "Active" : "Inactive"}
                      </span>
                    )}
                  </div>

                  <div className="info-row">
                    <label>Status</label>
                    {isEdit ? (
                      <select name="status" value={formData?.status || "Pending"} onChange={handleChange}>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    ) : (
                      <span className={getStatusClass(selected?.status)}>
                        {getStatusIcon(selected?.status)} {selected?.status || 'N/A'}
                      </span>
                    )}
                  </div>
                  <div className="info-row">
                    <label>Private Note</label>
                    {isEdit ?
                      <textarea name="privateNote" value={formData?.privateNote || ""} onChange={handleChange} placeholder="(Not visible to Affiliate)" /> :
                      <span>{selected?.privateNote || "n/a"}</span>
                    }
                  </div>
                </div>
              </div>

              {/* API SECTION */}
              <div className="info-section">
                <h4>API</h4>
                <div className="info-grid">
                  {/* API Access - Switch Button */}
                  <div className="info-row">
                    <label>API Access</label>
                    {isEdit ? (
                      <label className="switch-label">
                        <input
                          type="checkbox"
                          className="switch-input"
                          checked={formData?.apiAccess || false}
                          onChange={(e) => handleSwitchChange('apiAccess', e.target.checked)}
                        />
                        <span className="switch-slider"></span>
                        <span className="switch-text">
                          {formData?.apiAccess ? "Yes" : "No"}
                        </span>
                      </label>
                    ) : (
                      <span className={formData?.apiAccess ? "active-text" : "inactive-text"}>
                        {formData?.apiAccess ? "Yes" : "No"}
                      </span>
                    )}
                  </div>
                  <div className="info-row">
                    <label>Affiliate ID</label>
                    <span>{selected?.id || "4860"}</span>
                  </div>
                  <div className="info-row">
                    <label>API Key</label>
                    <span style={{ fontFamily: "monospace" }}>{selected?.apiKey || "cd8d5140d3552c21bf01eca976f82495"}</span>
                  </div>
                </div>
              </div>
              
              {/* ACTION BUTTONS */}
                           {/* ACTION BUTTONS */}
              {isEdit && (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    className="cancel-btn-small"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
            
                  <button
                    className="submit-btn-small"
                    onClick={handleSubmit}
                  >
                    Save
                  </button>
                </div>
              )}
              
              {/* SIGNUP / SYSTEM INFO SECTION - ENHANCED WITH ALL FIELDS */}
              <div className="info-section">
                <h4>Sign Up & System Info</h4>
                <div className="info-grid">
                  <div className="info-row">
                    <label>Sign Up Date</label>
                    <span>{formatDateOnly(selected?.signupDate || selected?.createdOn)}</span>
                  </div>
                  <div className="info-row">
                    <label>Sign Up Source</label>
                    {isEdit ?
                      <input name="signupSource" value={formData?.signupSource || ""} onChange={handleChange} /> :
                      <span>{selected?.signupSource || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Sign In Sessions</label>
                    <span>{getSignInSessions()}</span>
                  </div>
                  <div className="info-row">
                    <label>Signup Questions</label>
                    <div className="signup-questions">
                      {selected?.education || selected?.gender || selected?.age || selected?.experience ? (
                        <div className="questions-grid">
                          {selected?.education && (
                            <div className="question-item">
                              <span className="question-label">Education:</span>
                              <span className="question-answer">{selected.education}</span>
                            </div>
                          )}
                          {selected?.gender && (
                            <div className="question-item">
                              <span className="question-label">Gender:</span>
                              <span className="question-answer">{selected.gender}</span>
                            </div>
                          )}
                          {selected?.age && (
                            <div className="question-item">
                              <span className="question-label">Age:</span>
                              <span className="question-answer">{selected.age}</span>
                            </div>
                          )}
                          {selected?.experience && (
                            <div className="question-item">
                              <span className="question-label">Experience:</span>
                              <span className="question-answer">{selected.experience}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">No Records Found</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">
            <div className="dropdown-wrapper">
              <select onChange={handleSelect} value={selected?.id || ""}>
                <option value="">Select Affiliate</option>
                {affiliates.map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.id} - {item.firstName} {item.lastName} ({item.email})
                  </option>
                ))}
              </select>
            </div>

            {/* STATS CARDS */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <span className="stat-label">Total Revenue</span>
                  <h3>${totalRevenue.toLocaleString()}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🖱️</div>
                <div className="stat-content">
                  <span className="stat-label">Total Clicks</span>
                  <h3>{totalClicks.toLocaleString()}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <span className="stat-label">Conversions</span>
                  <h3>{totalConversions.toLocaleString()}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <span className="stat-label">Conversion Rate</span>
                  <h3>{conversionRate}%</h3>
                </div>
              </div>
            </div>

            {/* REPORTS SECTION WITH CHARTS */}
            <div className="card">
              <div className="reports-header">
                <h3>Performance Reports - {currentYear}</h3>
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color revenue-color"></span>
                    Revenue (USD)
                  </span>
                  <span className="legend-item">
                    <span className="legend-color clicks-color"></span>
                    Clicks
                  </span>
                  <span className="legend-item">
                    <span className="legend-color conversions-color"></span>
                    Conversions
                  </span>
                </div>
              </div>

              <div className="report-box">
                <div className="report-item">
                  <p>Earnings</p>
                  <h2>${totalRevenue.toLocaleString()} USD</h2>
                  <span className="trend positive">↑ 15.3% vs last year</span>
                </div>
                <div className="report-item">
                  <p>EPC (Earnings Per Click)</p>
                  <h2>${epc}</h2>
                  <span className="trend positive">↑ 8.7% vs last year</span>
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-wrapper">
                  <div className="chart-y-axis">
                    <div className="y-axis-label">Revenue (USD)</div>
                    {[maxRevenue, maxRevenue * 0.75, maxRevenue * 0.5, maxRevenue * 0.25, 0].map((value, i) => (
                      <div key={i} className="y-axis-tick">
                        ${Math.round(value).toLocaleString()}
                      </div>
                    ))}
                  </div>
                  <div className="chart-area">
                    <svg className="revenue-chart" viewBox="0 0 800 300" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M ${chartData.revenue.map((value, index) =>
                          `${(index / (chartData.revenue.length - 1)) * 800},${300 - (value / maxRevenue) * 250}`
                        ).join(' L ')}`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                      <path
                        d={`M ${chartData.revenue.map((value, index) =>
                          `${(index / (chartData.revenue.length - 1)) * 800},${300 - (value / maxRevenue) * 250}`
                        ).join(' L ')} L 800,300 L 0,300 Z`}
                        fill="url(#revenueGradient)"
                      />
                      {chartData.revenue.map((value, index) => (
                        <circle
                          key={index}
                          cx={(index / (chartData.revenue.length - 1)) * 800}
                          cy={300 - (value / maxRevenue) * 250}
                          r="3"
                          fill="#3b82f6"
                          stroke="white"
                          strokeWidth="2"
                        />
                      ))}
                    </svg>
                    <div className="chart-x-axis">
                      {chartData.months.map((month, index) => (
                        <div key={index} className="x-axis-tick">{month}</div>
                      ))}
                    </div>
                  </div>
                  <div className="chart-y-axis-right">
                    <div className="y-axis-label">Clicks / Conversions</div>
                    {[maxClicks, maxClicks * 0.5, 0].map((value, i) => (
                      <div key={i} className="y-axis-tick">
                        {Math.round(value).toLocaleString()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chart-stats">
                <div className="stat-item">
                  <span className="stat-label">Best Month (Revenue)</span>
                  <span className="stat-value">
                    {chartData.months[chartData.revenue.indexOf(Math.max(...chartData.revenue))]} -
                    ${Math.max(...chartData.revenue).toLocaleString()}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Best Month (Conversions)</span>
                  <span className="stat-value">
                    {chartData.months[chartData.conversions.indexOf(Math.max(...chartData.conversions))]} -
                    {Math.max(...chartData.conversions).toLocaleString()} conversions
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average Monthly Earnings</span>
                  <span className="stat-value">
                    ${Math.round(totalRevenue / 12).toLocaleString()}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">EPC Average</span>
                  <span className="stat-value">
                    ${epc} per click
                  </span>
                </div>
              </div>
            </div>

            {/* OFFERS SECTION */}
            <div className="card">
              <h3>Applied Offers</h3>
              <div className="manage-controls">
                <select className="full-width">
                  <option>Select Offer to Apply</option>
                </select>
                <select className="full-width">
                  <option>Select Offer to Remove</option>
                </select>
              </div>
              <div className="offers-list">
                <p className="text-muted">📋 No active offers assigned</p>
              </div>
            </div>

            {/* Invoice SECTION */}
            <div className="card">
              <h3>Payment History</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="4" className="empty-state">💸 No payment records found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* AffiliatesTrackingURL LINK SECTION */}
            <div className="card">
              <h3>Tracking Link</h3>
              <div className="tracking-link-box">
                <p className="text-muted">🔗 Affiliate tracking link will appear here</p>
                <button className="copy-link-btn" disabled>Copy Tracking Link</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AffiliateDetails;