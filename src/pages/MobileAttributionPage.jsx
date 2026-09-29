import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/PostbackPage.css";
import "../css/MobileAttributionPage.css";

const MOBILE_ATTRIBUTION_INTEGRATIONS = [
  { key: "offer18", name: "Offer18 (SDK)", logoClass: "logo-offer18", buttons: [{ label: "Android", icon: "📱" }, { label: "iOS (comming soon)", icon: "🍎", disabled: true }] },
  { key: "appsflyer", name: "Appsflyer", logoClass: "logo-appsflyer", buttons: [{ label: "Setup", icon: "+" }, { label: "Read", icon: "📖" }] },
  { key: "singular", name: "Singular", logoClass: "logo-singular", buttons: [{ label: "Setup", icon: "+" }, { label: "Read", icon: "📖" }] },
  { key: "branch", name: "Branch", logoClass: "logo-branch", buttons: [{ label: "Setup", icon: "+" }, { label: "Read", icon: "📖" }] },
  { key: "adjust", name: "Adjust", logoClass: "logo-adjust", buttons: [{ label: "Setup", icon: "+" }, { label: "Read", icon: "📖" }] },
  { key: "kochava", name: "Kochava", logoClass: "logo-kochava", buttons: [{ label: "Setup", icon: "+" }] },
];

export default function MobileAttributionPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="mobile-attribution-page">
          <section className="mobile-attribution-title-card">
            <h1><span aria-hidden="true">⚙</span> Integration</h1>
          </section>

          <div className="mobile-attribution-note">
            <span aria-hidden="true">ⓘ</span> Custom Domain is recommended for all types of integrations.
          </div>

          <h3 className="mobile-attribution-section-title">Advertiser Mobile Attribution</h3>
          <div className="mobile-attribution-grid">
            {MOBILE_ATTRIBUTION_INTEGRATIONS.map((integration) => (
              <div className="mobile-attribution-card" key={integration.key}>
                <p className="mobile-attribution-card-name">{integration.name}</p>
                <div className={`mobile-attribution-logo ${integration.logoClass}`}>{integration.name}</div>
                <div className="mobile-attribution-card-buttons">
                  {integration.buttons.map((button) => (
                    <button
                      type="button"
                      key={button.label}
                      className="mobile-attribution-btn"
                      disabled={button.disabled}
                      onClick={() => alert(`${integration.name} - ${button.label} is not connected yet.`)}
                    >
                      <span aria-hidden="true">{button.icon}</span> {button.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
