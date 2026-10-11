import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/AffiliatePostbackTestPage.css";

const RESULTS_API = "https://localhost:7150/api/LinkTestResults";
const SOURCE = "AffiliatePostbackTest";

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AffiliatePostbackTestLogsPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${RESULTS_API}?source=${SOURCE}`, { headers: { accept: "*/*" }, signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

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
                <h1><span aria-hidden="true">☰</span> Postback Test Logs</h1>
                <p className="apt-subtitle">Past affiliate postback test runs</p>
              </div>
              <div className="apt-header-actions">
                <button type="button" className="apt-dark-btn" onClick={() => navigate("/affiliates/postback-test")}>
                  <span aria-hidden="true">🖇</span> Back to Test
                </button>
              </div>
            </div>

            <div className="apt-table-scroll">
              <table className="apt-table">
                <thead>
                  <tr>
                    <th>Tested On</th>
                    <th>Affiliate URL</th>
                    <th>User Agent</th>
                    <th>Status</th>
                    <th>Final HTTP Code</th>
                    <th>Redirects</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="6" className="apt-message">Loading logs…</td></tr>}
                  {!loading && logs.length === 0 && <tr><td colSpan="6" className="apt-message">No postback tests have been run yet</td></tr>}
                  {!loading && logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDateTime(log.startedOn)}</td>
                      <td className="apt-url-cell" title={log.url}>{log.url}</td>
                      <td className="apt-ua-cell" title={log.userAgent}>{log.userAgent || "-"}</td>
                      <td><span className={`apt-result-badge ${log.status === "Success" ? "success" : "failed"}`}>{log.status}</span></td>
                      <td>{log.finalStatusCode ?? "-"}</td>
                      <td>{log.redirectCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
