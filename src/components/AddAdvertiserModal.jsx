import React, { useState } from "react";
import "../css/Modal.css";
import { useNavigate } from "react-router-dom";

const AddAdvertiserModal = ({ onClose }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    passwordHash: "",
    accountManagerId: user?.id || "",
    status: "Active",
    sendCredentials: false,
    isActive: true
  });

  const [loading, setLoading] = useState(false);

  // ✅ NEW STATE
  const [advertiserId, setAdvertiserId] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const generatePassword = () => {
    const random = Math.random().toString(36).slice(-8);
    setFormData({ ...formData, passwordHash: random });
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert("User not logged in ❌");
      return;
    }

    if (!formData.firstName || !formData.email) {
      alert("Please fill required fields ❌");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("https://localhost:7129/api/Advertisers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          id: 0,
          ...formData,
          modifiedOn: new Date().toISOString(),
          createdOn: new Date().toISOString()
        })
      });

      const data = await response.json();

      // ✅ SET ADVERTISER ID
      setAdvertiserId(data.id);

      alert("Advertiser Created Successfully ✅");

      // ❌ REMOVED onClose() and navigate()

    } catch (error) {
      console.error(error);
      alert("Error creating advertiser ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* HEADER */}
        <div className="modal-header">
          <h3>Create Advertiser</h3>
          <span className="close-btn" onClick={onClose}>✖</span>
        </div>

        <div className="modal-body">

          {/* NAME */}
          <div className="form-row">
            <label>Name *</label>
            <div className="flex">
              <input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* COMPANY */}
          <div className="form-row">
            <label>Company (Brand)</label>
            <input
              name="companyName"
              placeholder="Company"
              value={formData.companyName}
              onChange={handleChange}
            />
          </div>

          {/* EMAIL */}
          <div className="form-row">
            <label>Email *</label>
            <input
              name="email"
              placeholder="test@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* PASSWORD */}
          <div className="form-row">
            <label>Password *</label>
            <div className="row">
              <div className="col-md-9">
                <input
                  name="passwordHash"
                  value={formData.passwordHash}
                  onChange={handleChange}
                  placeholder="Enter or generate password"
                  className="form-control"
                />
              </div>
              <div className="col-md-3">
                <button
                  className="btn btn-secondary small"
                  type="button"
                  onClick={generatePassword}
                  style={{ width: "100%" }}
                >
                  Generate Password
                </button>
              </div>
            </div>
          </div>

          {/* ACCOUNT MANAGER */}
          <div className="form-row">
            <label>Account Manager</label>
            <input
              value={
                user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : ""
              }
              disabled
            />
          </div>

          {/* STATUS */}
          <div className="form-row">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* SEND CREDENTIALS */}
          <div className="form-row toggle">
            <label className="switch">
              <input
                type="checkbox"
                name="sendCredentials"
                checked={formData.sendCredentials}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
            <span>Send Credentials to User</span>
          </div>

          {/* BUTTONS */}
           <div className="row">
             <div className="col-md-8">
               {/* yaha tera form ya content */}
             </div>
           
             <div className="col-md-4 d-flex justify-content-end gap-2">
               <button
                 className="btn btn-secondary"
                 onClick={onClose}
                 disabled={loading}
               >
                 Cancel
               </button>
           
               <button
                 className="btn btn-primary"
                 onClick={handleSubmit}
                 disabled={loading}
               >
                 {loading ? "Creating..." : "Submit"}
               </button>
             </div>
           </div>

          {/* ✅ SHOW AFTER SUCCESS */}
{advertiserId && (
  <>
    <hr />

    <div className="advertiser-result row align-items-center">
      
      {/* Advertiser ID (Clickable) */}
      <div className="col-md-6">
        <p className="mb-0">
          <b>Advertiser ID :</b>{" "}
          <span
            className="advertiser-link"
            onClick={() => navigate(`/advertiser/${advertiserId}`)}
          >
            {advertiserId}
          </span>
        </p>
      </div>

      {/* Empty space */}
      <div className="col-md-3"></div>

      {/* Icon Button */}
      <div className="col-md-3 text-end">
        <button
          className="btn btn-light icon-btn"
          onClick={() => navigate(`/advertiser/${advertiserId}`)}
        >
          👁️
        </button>
      </div>

    </div>
  </>
)}

        </div>
      </div>
    </div>
  );
};

export default AddAdvertiserModal;