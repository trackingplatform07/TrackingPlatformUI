import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/AffiliatePostbackTestPage.css";

const RESULTS_API = "https://localhost:7150/api/LinkTestResults";
const SOURCE = "AffiliatePostbackTest";

const USER_AGENTS = {
  Desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Android: "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36",
  iOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
};

const currentUserName = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Administrator";
  } catch {
    return "Administrator";
  }
};

export default function AffiliatePostbackTestPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [userAgent, setUserAgent] = useState(USER_AGENTS.Android);
  const [activeDevice, setActiveDevice] = useState("Android");
  const [deepTest, setDeepTest] = useState(false);

  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const applyDevice = (device) => {
    setActiveDevice(device);
    setUserAgent(USER_AGENTS[device]);
  };

  const initiateTest = async () => {
    if (!affiliateUrl.trim()) {
      alert("Please enter an Affiliate URL to test.");
      return;
    }
    try {
      setTesting(true);
      setResult(null);
      const response = await fetch(`${RESULTS_API}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          url: affiliateUrl.trim(),
          userAgent: userAgent.trim(),
          source: SOURCE,
          createdBy: currentUserName(),
        }),
      });
      if (!response.ok) throw new Error("Unable to run test");
      setResult(await response.json());
    } catch {
      setResult({ status: "Error", resultText: "Unable to reach the test API. Please check the backend and try again." });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((v) => !v)}
        />

        <main className="apt-page">
          <section className="apt-card">
            <div className="apt-header">
              <div>
                <h1><span aria-hidden="true">🖇</span> Affiliate Postback Test</h1>
                <p className="apt-subtitle">Fire a test click on an Affiliate link and check the postback it returns</p>
              </div>
              <div className="apt-header-actions">
                <button
                  type="button"
                  className={`apt-dark-btn ${deepTest ? "active" : ""}`}
                  onClick={() => setDeepTest((v) => !v)}
                >
                  <span aria-hidden="true">🛡</span> Deep Postback Test
                </button>
                <button type="button" className="apt-dark-btn" onClick={() => navigate("/affiliates/postback-test/logs")}>
                  <span aria-hidden="true">☰</span> Postback Test Logs
                </button>
              </div>
            </div>

            <div className="apt-field">
              <label>Affiliate URL</label>
              <input
                type="text"
                placeholder="http://example.com/.."
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
              />
              <small className="apt-hint">
                Make Sure All Target filters are disabled on Affiliate Test link ( GEO , Browser , ISP Targeting etc ), Default Test Location : US
              </small>
            </div>

            <div className="apt-field">
              <label>Useragent</label>
              <input
                type="text"
                value={userAgent}
                onChange={(e) => { setUserAgent(e.target.value); setActiveDevice(""); }}
              />
              <div className="apt-device-row">
                {Object.keys(USER_AGENTS).map((device) => (
                  <button
                    type="button"
                    key={device}
                    className={`apt-device-btn ${activeDevice === device ? "active" : ""}`}
                    onClick={() => applyDevice(device)}
                  >
                    {device}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="apt-initiate-btn" onClick={initiateTest} disabled={testing}>
              <span aria-hidden="true">🕐</span> {testing ? "Testing…" : "Step 1) Initiate Test"}
            </button>

            {result && (
              <div className="apt-result">
                <h3>Step 2) Test Result</h3>
                <div className="apt-result-summary">
                  <span className={`apt-result-badge ${result.status === "Success" ? "success" : "failed"}`}>{result.status}</span>
                  {result.finalStatusCode && <span>Final HTTP Code: {result.finalStatusCode}</span>}
                  {typeof result.redirectCount === "number" && <span>Redirects: {result.redirectCount}</span>}
                </div>
                {deepTest && (
                  <textarea className="apt-result-box" readOnly value={result.resultText || "No response captured."} />
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
