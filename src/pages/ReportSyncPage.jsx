import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/PostbackPage.css";
import "../css/MobileAttributionPage.css";
import "../css/ReportSyncPage.css";

const PARTNERS = [
  { key: "offer18-affiliate", name: "Offer18", subname: "Offer18 (Affiliate)", logo: "offer18" },
  { key: "offer18-admin", name: "Offer18", subname: "Offer18 (Admin)", logo: "offer18" },
  { key: "facebook", name: "Facebook", subname: "Facebook", logo: "facebook" },
];

export default function ReportSyncPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chosenIntegration, setChosenIntegration] = useState("");

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="mobile-attribution-page">
          <section className="report-sync-panel report-sync-header-panel">
            <h1><span aria-hidden="true">🗂</span> Report Sync</h1>
            <select
              className="report-sync-select"
              value={chosenIntegration}
              onChange={(e) => setChosenIntegration(e.target.value)}
            >
              <option value="">Choose Integration</option>
              <option value="offer18-affiliate">Offer18 (Affiliate)</option>
              <option value="offer18-admin">Offer18 (Admin)</option>
              <option value="facebook">Facebook</option>
            </select>
          </section>

          <section className="report-sync-panel">
            <h3><span aria-hidden="true">🗂</span> Active Integrations (0)</h3>
          </section>

          <section className="report-sync-panel">
            <h3><span aria-hidden="true">🗂</span> Partners</h3>
          </section>

          <div className="report-sync-grid">
            {PARTNERS.map((partner) => (
              <div className="mobile-attribution-card report-sync-card" key={partner.key}>
                {partner.logo === "facebook" ? (
                  <div className="report-sync-logo-circle report-sync-logo-facebook">
                    <span aria-hidden="true">f</span>
                  </div>
                ) : (
                  <div className="report-sync-logo-text logo-offer18">
                    <span aria-hidden="true">✓</span>{partner.name}
                  </div>
                )}
                <p className="report-sync-card-subname">{partner.subname}</p>
                <div className="mobile-attribution-card-buttons">
                  <button
                    type="button"
                    className="mobile-attribution-btn"
                    onClick={() => alert(`${partner.subname} - Setup is not connected yet.`)}
                  >
                    <span aria-hidden="true">+</span> Setup
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
