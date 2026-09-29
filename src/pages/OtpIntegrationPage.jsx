import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/MobileAttributionPage.css";
import "../css/OfferSyncPage.css";
import "../css/OtpIntegrationPage.css";
import { OTP_PARTNERS } from "../data/otpPartners";

export default function OtpIntegrationPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const filteredPartners = OTP_PARTNERS.filter((partner) =>
    partner.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="mobile-attribution-page">
          <section className="offer-sync-header-card">
            <h1><span aria-hidden="true">📱</span> OTP Integration</h1>
            <div className="offer-sync-header-actions">
              <input
                type="text"
                className="offer-sync-search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </section>

          <div className="offer-sync-partners-grid">
            {filteredPartners.length === 0 ? (
              <p className="offer-sync-no-results">No partners found.</p>
            ) : (
              filteredPartners.map((partner) => (
                <div className="mobile-attribution-card offer-sync-partner-card" key={partner.key}>
                  <div
                    className={`offer-sync-logo-badge otp-logo-${partner.variant}`}
                    style={{
                      color: partner.color,
                      background: partner.bg || undefined,
                    }}
                  >
                    {partner.variant === "otp" ? (
                      <span className="otp-logo-icon" aria-hidden="true">📱✓</span>
                    ) : partner.variant === "shield" ? (
                      <span className="otp-logo-icon" aria-hidden="true">🛡</span>
                    ) : null}
                    {partner.name}
                  </div>
                  <p className="offer-sync-partner-subname">{partner.name}</p>
                  <div className="mobile-attribution-card-buttons">
                    <button
                      type="button"
                      className="mobile-attribution-btn"
                      onClick={() => navigate(`/integration/otp-integration/${partner.key}`)}
                    >
                      <span aria-hidden="true">+</span> Setup
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
