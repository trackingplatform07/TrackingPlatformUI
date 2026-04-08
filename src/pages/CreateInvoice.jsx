import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/CreateInvoice.css";

const CreateInvoice = () => {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="of-layout">

      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="of-main">

        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="invoice-page">

          {/* Header */}
          <div className="invoice-header">
            <h2>Create Invoice</h2>
            <button className="btn small">Invoices</button>
          </div>

          {/* Form */}
          <div className="invoice-box">

            <div className="form-grid">

              <div className="form-group">
                <label>Advertiser</label>
                <select>
                  <option>Select Advertiser</option>
                </select>
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select>
                  <option>Select Currency</option>
                </select>
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select>
                  <option>Select Timezone</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reports Period</label>
                <div className="flex">
                  <input type="date" defaultValue="2026-02-01" />
                  <input type="date" defaultValue="2026-02-28" />
                </div>
              </div>

              <div className="form-group">
                <label>Offers</label>
                <input placeholder="Select Offer" />
              </div>

              <div className="form-group">
                <label>Item Group</label>
                <select>
                  <option>Total Amount</option>
                </select>
              </div>

            </div>

            <div className="form-footer">
              <button className="btn primary">Fetch Reports</button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CreateInvoice;