import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/MobileAttributionPage.css";
import "../css/FraudDetectionToolsPage.css";

const TOOLS = [
  {
    key: "fraud-fender",
    name: "Fraud Fender",
    tag: "in-house tool",
    icon: "gear",
    path: "/fraud-detection/fraud-fender",
  },
  {
    key: "conversion-risk-monitor",
    name: "Conversion Risk Monitor",
    tag: "in-house tool",
    icon: "chart",
    path: "/fraud-detection/conversion-risk-monitor",
  },
  {
    key: "24metrics",
    name: "24metrics",
    tag: "3rd Party Integration",
    icon: "24metrics",
    path: null,
  },
  {
    key: "fraudscore",
    name: "Fraudscore",
    tag: "3rd Party Integration",
    icon: "fraudscore",
    path: null,
  },
];

export default function FraudDetectionToolsPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleManage = (tool) => {
    if (tool.path) navigate(tool.path);
    else alert(`${tool.name} is not connected yet.`);
  };

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
            <h1><span aria-hidden="true">⚙</span> Fraud Detection</h1>
          </section>

          <div className="fraud-tools-grid">
            {TOOLS.map((tool) => (
              <div className="fraud-tools-card" key={tool.key}>
                <div className={`fraud-tools-icon fraud-tools-icon-${tool.icon}`}>
                  {tool.icon === "gear" && <span aria-hidden="true">⚙</span>}
                  {tool.icon === "chart" && <span aria-hidden="true">📈</span>}
                  {tool.icon === "24metrics" && (
                    <span className="fraud-tools-logo-text">
                      <span aria-hidden="true">☁</span>24<span className="fraud-tools-logo-thin">metrics</span>
                    </span>
                  )}
                  {tool.icon === "fraudscore" && (
                    <span className="fraud-tools-logo-text fraud-tools-logo-fraudscore">
                      Fraud<span className="fraud-tools-logo-score">S</span>
                      <span className="fraud-tools-logo-dot" aria-hidden="true">●</span>
                      <span className="fraud-tools-logo-score">re</span>
                    </span>
                  )}
                </div>
                <h3 className="fraud-tools-card-name">{tool.name}</h3>
                <p className="fraud-tools-card-tag">{tool.tag}</p>
                <button type="button" className="fraud-tools-manage-btn" onClick={() => handleManage(tool)}>
                  <span aria-hidden="true">⚙</span> Manage
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
