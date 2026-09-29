import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/PostbackPage.css";
import "../css/MobileAttributionPage.css";

const ADVERTISER_ECOMMERCE_INTEGRATIONS = [
  { key: "shopify", name: "Shopify", logoClass: "logo-shopify", buttons: [{ label: "Setup", icon: "+" }] },
  { key: "woocommerce", name: "WooCommerce", logoClass: "logo-woocommerce", buttons: [{ label: "Setup", icon: "+" }] },
];

export default function ECommerceIntegrationPage() {
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

          <h3 className="mobile-attribution-section-title">Advertiser e-Commerce</h3>
          <div className="mobile-attribution-grid">
            {ADVERTISER_ECOMMERCE_INTEGRATIONS.map((integration) => (
              <div className="mobile-attribution-card" key={integration.key}>
                <p className="mobile-attribution-card-name">{integration.name}</p>
                <div className={`mobile-attribution-logo ${integration.logoClass}`}>{integration.name}</div>
                <div className="mobile-attribution-card-buttons">
                  {integration.buttons.map((button) => (
                    <button
                      type="button"
                      key={button.label}
                      className="mobile-attribution-btn"
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
