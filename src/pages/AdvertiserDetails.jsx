import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/AdvertiserDetails.css";
import { useParams } from "react-router-dom";

const AdvertiserDetails = () => {
  const { id } = useParams();

  const [advertisers, setAdvertisers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [countries, setCountries] = useState([]);
  
  // State for action buttons highlight
  const [activeAction, setActiveAction] = useState(null);
  
  // State for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Sample data for charts
  const [chartData] = useState({
    revenue: [1250, 2350, 3420, 2890, 4120, 5670, 4890, 6230, 7140, 6820, 7930, 8450],
    conversions: [45, 78, 112, 95, 138, 189, 162, 207, 238, 227, 264, 281],
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
    return null;
  };

  // 🌍 Countries
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => res.json())
      .then((data) => {
        const list = data.map((c) => c.name.common).sort();
        setCountries(list);
      });
  }, []);

  // 🔹 Get advertisers list
  useEffect(() => {
    fetch("https://localhost:7129/api/Advertisers")
      .then((res) => res.json())
      .then((data) => setAdvertisers(data));
  }, []);

  // 🔹 Fetch single advertiser
  const fetchAdvertiser = (id) => {
    if (!id) return;

    setLoading(true);

    fetch(`https://localhost:7129/api/Advertisers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSelected(data);
        setFormData(data);
        setIsEdit(false);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) fetchAdvertiser(id);
  }, [id]);

  const handleSelect = (e) => {
    fetchAdvertiser(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await fetch(`https://localhost:7129/api/Advertisers/details/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id: selected.id,
        }),
      });
      alert("Updated successfully ✅");
      setSelected(formData);
      setIsEdit(false);
    } catch (err) {
      console.error(err);
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
    setTimeout(() => setActiveAction(null), 300);
  };
  
  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Calculate max values for chart scaling
  const maxRevenue = Math.max(...chartData.revenue);
  const maxConversions = Math.max(...chartData.conversions);
  
  // Get current year
  const currentYear = new Date().getFullYear();

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
                 {selected
                   ? `${selected.firstName?.charAt(0)?.toUpperCase()}${selected.lastName?.charAt(0)?.toUpperCase()}`
                   : "NA"}
               </div>

                <div style={{ width: "100%" }}>
                  <div className="profile-header-top">
                    <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                      Advertiser : #{selected?.id}
                    </p>

                    {selected && (
                      <button className="edit-btn" onClick={() => setIsEdit(!isEdit)}>
                        {isEdit ? "Cancel" : "Edit"}
                      </button>
                    )}
                  </div>

                 <h3>
                    {selected?.firstName ? selected.firstName.charAt(0).toUpperCase() + selected.firstName.slice(1).toLowerCase() : ''}
                    {selected?.firstName && selected?.lastName ? ' ' : ''}
                    {selected?.lastName ? selected.lastName.charAt(0).toUpperCase() + selected.lastName.slice(1).toLowerCase() : ''}
                  </h3>
                  <p className="sub-text">{selected?.companyName}</p>
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
                  🔑 Login as Advertiser
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
                  className={`action-btn ${activeAction === 'invoices' ? 'active' : ''}`}
                  onClick={() => handleActionClick('invoices')}
                >
                  📄 Invoices
                </button>
                <button 
                  className={`action-btn ${activeAction === 'email' ? 'active' : ''}`}
                  onClick={() => handleActionClick('email')}
                >
                  ✉️ Email
                </button>
                <button 
                  className={`action-btn ${activeAction === 'postback' ? 'active' : ''}`}
                  onClick={() => handleActionClick('postback')}
                >
                  🔗 Postback
                </button>
                <button 
                  className={`action-btn ${activeAction === 'password' ? 'active' : ''}`}
                  onClick={() => handleActionClick('password')}
                >
                  🔐 Password Reset
                </button>
              </div>

              {/* PROFILE SECTION */}
              <div className="info-section">
                <h4>Profile</h4>
                <div className="info-grid">
                  <div className="info-row">
                    <label>First Name *</label>
                    {isEdit ? 
                      <input name="firstName" value={formData?.firstName || ""} onChange={handleChange}/> : 
                      <span>{selected?.firstName}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Last Name</label>
                    {isEdit ? 
                      <input name="lastName" value={formData?.lastName || ""} onChange={handleChange}/> : 
                      <span>{selected?.lastName}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Company</label>
                    {isEdit ? 
                      <input name="companyName" value={formData?.companyName || ""} onChange={handleChange}/> : 
                      <span>{selected?.companyName}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Mobile</label>
                    {isEdit ? 
                      <input name="mobileNumber" value={formData?.mobileNumber || ""} onChange={handleChange}/> : 
                      <span>{formData?.mobileNumber || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Address</label>
                    {isEdit ? 
                      <input name="address" value={formData?.address || ""} onChange={handleChange}/> : 
                      <span>{formData?.address || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>City</label>
                    {isEdit ? 
                      <input name="city" value={formData?.city || ""} onChange={handleChange}/> : 
                      <span>{formData?.city || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>State</label>
                    {isEdit ? 
                      <input name="state" value={formData?.state || ""} onChange={handleChange}/> : 
                      <span>{formData?.state || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Country</label>
                    {isEdit ? (
                      <select name="country" value={formData?.country || ""} onChange={handleChange}>
                        <option value="">Select Country</option>
                        {countries.map((c, i) => <option key={i}>{c}</option>)}
                      </select>
                    ) : <span>{formData?.country || "n/a"}</span>}
                  </div>
                  <div className="info-row">
                    <label>Zip</label>
                    {isEdit ? 
                      <input name="zipCode" value={formData?.zipCode || ""} onChange={handleChange}/> : 
                      <span>{formData?.zipCode || "n/a"}</span>
                    }
                  </div>
                </div>
              </div>

              {/* ACCOUNT SECTION */}
              <div className="info-section">
                <h4>Account</h4>
                <div className="info-grid">
                  <div className="info-row">
                    <label>Email</label>
                    {isEdit ? 
                      <input name="email" value={formData?.email || ""} onChange={handleChange}/> : 
                      <span>{selected?.email}</span>
                    }
                  </div>
                   <div className="info-row">
                    <label>Status</label>
                    {isEdit ? (
                      <select
                        value={formData?.status || "Active"}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
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
                    <label>Postback IP</label>
                    {isEdit ? 
                      <textarea name="postbackIp" value={formData?.postbackIp || ""} onChange={handleChange}/> : 
                      <span>{formData?.postbackIp || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Whitelist</label>
                    {isEdit ? 
                      <textarea name="whitelist" value={formData?.whitelist || ""} onChange={handleChange}/> : 
                      <span>{formData?.whitelist || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Additional Info</label>
                    {isEdit ? 
                      <textarea name="additionalInfo" value={formData?.additionalInfo || ""} onChange={handleChange}/> : 
                      <span>{formData?.additionalInfo || "n/a"}</span>
                    }
                  </div>
                  <div className="info-row">
                    <label>Private Note</label>
                    {isEdit ? 
                      <textarea name="privateNote" value={formData?.privateNote || ""} onChange={handleChange}/> : 
                      <span>{formData?.privateNote || "n/a"}</span>
                    }
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS - NOW ON RIGHT SIDE IN SINGLE ROW */}
                {isEdit && (
                  <div className="row align-items-center mt-3">
                    
                    {/* Left side (empty or content) */}
                    <div className="col-md-8"></div>
                
                    {/* Right side buttons */}
                    <div className="col-md-4 d-flex justify-content-end gap-2">
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
                
                  </div>
                )}

            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">
            <div className="dropdown-wrapper">
              <select onChange={handleSelect} value={selected?.id || ""}>
                <option value="">Select Advertiser</option>
                {advertisers.map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.id} - {item.firstName} {item.lastName} ({item.companyName})
                  </option>
                ))}
              </select>
            </div>

            {/* REPORTS SECTION WITH STATIC CHART */}
            <div className="card">
              <div className="reports-header">
                <h3>Reports - {currentYear}</h3>
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color revenue-color"></span>
                    Revenue (USD)
                  </span>
                  <span className="legend-item">
                    <span className="legend-color conversions-color"></span>
                    Conversions
                  </span>
                </div>
              </div>
              
              <div className="report-box">
                <div className="report-item">
                  <p>Total Revenue</p>
                  <h2>${chartData.revenue.reduce((a, b) => a + b, 0).toLocaleString()} USD</h2>
                  <span className="trend positive">↑ 23.5% vs last year</span>
                </div>
                <div className="report-item">
                  <p>Total Conversions</p>
                  <h2>{chartData.conversions.reduce((a, b) => a + b, 0).toLocaleString()}</h2>
                  <span className="trend positive">↑ 18.2% vs last year</span>
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
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
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
                    <svg className="conversions-chart" viewBox="0 0 800 200" preserveAspectRatio="none">
                      <path
                        d={`M ${chartData.conversions.map((value, index) => 
                          `${(index / (chartData.conversions.length - 1)) * 800},${200 - (value / maxConversions) * 150}`
                        ).join(' L ')}`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                      />
                      {chartData.conversions.map((value, index) => (
                        <circle
                          key={index}
                          cx={(index / (chartData.conversions.length - 1)) * 800}
                          cy={200 - (value / maxConversions) * 150}
                          r="3"
                          fill="#10b981"
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
                    <div className="y-axis-label">Conversions</div>
                    {[maxConversions, maxConversions * 0.75, maxConversions * 0.5, maxConversions * 0.25, 0].map((value, i) => (
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
                  <span className="stat-label">Average Monthly Revenue</span>
                  <span className="stat-value">
                    ${Math.round(chartData.revenue.reduce((a, b) => a + b, 0) / 12).toLocaleString()}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Conversion Rate</span>
                  <span className="stat-value">
                    {Math.round((chartData.conversions.reduce((a, b) => a + b, 0) / 
                      chartData.revenue.reduce((a, b) => a + b, 0)) * 100)} / $1K
                  </span>
                </div>
              </div>
            </div>

            {/* MANAGE SECTION */}
            <div className="card">
              <h3>Manage Affiliates</h3>
              <div className="manage-controls">
                <select className="full-width">
                  <option>Select Affiliate to Add</option>
                </select>
                <select className="full-width">
                  <option>Select Affiliate to Remove</option>
                </select>
              </div>
            </div>

            {/* BILLING SECTION */}
            <div className="card">
              <h3>Billing</h3>
              <div className="billing-info">
                <p className="text-muted">💰 No Tax Details Found</p>
              </div>
            </div>

            {/* INVOICES SECTION */}
            <div className="card">
              <h3>Invoices</h3>
              <div className="table-wrapper">
                 <table>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Due Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="5" className="empty-state">📭 No invoices found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdvertiserDetails;