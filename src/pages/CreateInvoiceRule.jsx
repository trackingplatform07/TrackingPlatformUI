import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/CreateInvoiceRule.css";
import { useNavigate } from "react-router-dom";

const CreateInvoiceRule = () => {

    const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="of-layout">

      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="of-main">

        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="rule-page">

          {/* Header */}
<div className="rule-header d-flex align-items-center">
  
  <h4 className="page-title mb-0">
    Automatic Advertiser Invoice
  </h4>

  <button 
    className="btn btn-primary list-btn ms-auto"
    onClick={() => navigate("/invoice-settings")}
  >
    List
  </button>

</div>

          {/* Form */}
          <div className="rule-form">

            <div className="form-group">
              <label>Rule Type</label>
              <select>
                <option>Global</option>
              </select>
            </div>

            <div className="form-group">
              <label>Timezone</label>
              <select>
                <option>Select Timezone</option>
              </select>
            </div>

            <div className="form-group">
              <label>Item Group</label>
              <select>
                <option>Total Amount</option>
              </select>
            </div>

            <div className="form-group">
              <label>Threshold Amount</label>
              <input />
            </div>

            <div className="form-group">
              <label>Invoice Date (For Monthly Period)</label>
              <select>
                <option>1</option>
              </select>
            </div>

            <div className="form-group flex">
              <div>
                <label>Discount</label>
                <select>
                  <option>Percentage</option>
                </select>
              </div>
              <input placeholder="Enter value" />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select>
                <option>Select Currency</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due date (Days)</label>
              <input />
            </div>

            <div className="form-group">
              <label>Default Status</label>
              <select>
                <option>Pending</option>
              </select>
            </div>

            <div className="form-group">
              <label>Invoice Frequency</label>
              <select>
                <option>Monthly</option>
              </select>
            </div>

            <div className="form-group">
              <label>Invoice Signature</label>
              <select>
                <option>Select Invoice Signature</option>
              </select>
            </div>

            <div className="form-group checkbox">
              <input type="checkbox" />
              <span>Notification</span>
            </div>

            <button className="btn primary submit">Submit</button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CreateInvoiceRule;