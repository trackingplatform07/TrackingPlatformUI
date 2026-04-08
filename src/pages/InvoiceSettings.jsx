import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/InvoiceSettings.css";
import { useNavigate } from "react-router-dom";
const InvoiceSettings = () => {

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

        <div className="invoice-settings-page">

          {/* Header */}
          <div className="settings-header">
            <h2>Automatic Advertiser Invoice</h2>

            <div className="settings-actions">
              <button className="btn primary" onClick={() => navigate("/create-invoice-rule")}> + Create</button>
              <button className="btn" onClick={() => navigate("/advertisers-billing")}>Advertiser Billing</button>

              <div className="entries">
                Show
                <select>
                  <option>20</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="settings-table-wrapper">
            <table className="settings-table">

              <thead>
                <tr>
                  <th>Rule Type</th>
                  <th>AdvertiserId</th>
                  <th>Group Type</th>
                  <th>Schedule</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>Last Updated At</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan="8" className="no-data">
                    No data available
                  </td>
                </tr>
              </tbody>

            </table>
          </div>

        </div>

      </div>

    </div>
  );
};

export default InvoiceSettings;