import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ReferralPage.css";

const REFERRALS_API = "https://localhost:7150/api/Referrals";

const formatUsd = (value) => `${Number(value || 0).toFixed(2)} USD`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function ReferralPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("General");

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(REFERRALS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load referral summary");
      setSummary(await response.json());
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const copyLink = async () => {
    if (!summary?.referralLink) return;
    try {
      await navigator.clipboard.writeText(summary.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert(summary.referralLink);
    }
  };

  const toggleVisibility = async () => {
    if (!summary || savingVisibility) return;
    try {
      setSavingVisibility(true);
      const response = await fetch(`${REFERRALS_API}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !summary.affiliateDashboardVisible }),
      });
      if (!response.ok) throw new Error("Unable to update visibility");
      setSummary(await response.json());
    } catch {
      alert("Unable to update affiliate dashboard visibility. Please try again.");
    } finally {
      setSavingVisibility(false);
    }
  };

  const accounts = summary?.referredAccounts || [];

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="ref-page">
          <section className="ref-card">
            <div className="ref-header">
              <div>
                <h1><span aria-hidden="true">🚀</span> Referral</h1>
                <p className="ref-subtitle">Invite networks to Offer18 and earn a bonus on their plans</p>
              </div>
              <div className="ref-tabs">
                <button
                  type="button"
                  className={`ref-tab-btn ${activeTab === "General" ? "active" : ""}`}
                  onClick={() => setActiveTab("General")}
                >
                  <span aria-hidden="true">📋</span> General
                </button>
                <button
                  type="button"
                  className={`ref-tab-btn ${activeTab === "Billing" ? "active" : ""}`}
                  onClick={() => setActiveTab("Billing")}
                >
                  <span aria-hidden="true">$</span> Billing
                </button>
              </div>
            </div>

            {loading && <p className="ref-message">Loading referral program…</p>}

            {!loading && summary && activeTab === "General" && (
              <>
                <div className="ref-stats">
                  <div className="ref-stat-card">
                    <span className="ref-stat-icon">👥</span>
                    <div>
                      <div className="ref-stat-label">Referred Users</div>
                      <div className="ref-stat-value">{summary.referredUsers}</div>
                    </div>
                  </div>
                  <div className="ref-stat-card">
                    <span className="ref-stat-icon">📈</span>
                    <div>
                      <div className="ref-stat-label">Total Profit</div>
                      <div className="ref-stat-value">{formatUsd(summary.totalProfit)}</div>
                    </div>
                  </div>
                  <div className="ref-stat-card">
                    <span className="ref-stat-icon">✓</span>
                    <div>
                      <div className="ref-stat-label">Paid Amount</div>
                      <div className="ref-stat-value">{formatUsd(summary.paidAmount)}</div>
                    </div>
                  </div>
                  <div className="ref-stat-card">
                    <span className="ref-stat-icon">⏳</span>
                    <div>
                      <div className="ref-stat-label">Due Amount</div>
                      <div className="ref-stat-value">{formatUsd(summary.dueAmount)}</div>
                    </div>
                  </div>
                </div>

                <div className="ref-link-section">
                  <div className="ref-link-label">Referral Link</div>
                  <div className="ref-link-row">
                    <input className="ref-link-input" readOnly value={summary.referralLink} />
                    <button type="button" className="ref-copy-btn" onClick={copyLink}>
                      <span aria-hidden="true">⧉</span> {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="ref-bottom-grid">
                  <div className="ref-accounts-card">
                    <h2><span aria-hidden="true">👥</span> Referred Accounts</h2>
                    <p className="ref-accounts-subtitle">Accounts that signed up through your referral link</p>

                    {accounts.length === 0 ? (
                      <p className="ref-message">No referred accounts yet</p>
                    ) : (
                      <table className="ref-accounts-table">
                        <thead>
                          <tr>
                            <th>Account</th>
                            <th>Signed Up</th>
                            <th>Status</th>
                            <th>Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accounts.map((account) => (
                            <tr key={account.id}>
                              <td>
                                <div className="ref-account-name">{account.accountName}</div>
                                {account.email && <div className="ref-account-email">{account.email}</div>}
                              </td>
                              <td>{formatDate(account.signedUpOn)}</td>
                              <td>{account.status}</td>
                              <td>{formatUsd(account.profit)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="ref-side-column">
                    <div className="ref-visibility-card">
                      <div>
                        <div className="ref-visibility-title">Affiliate Dashboard Visibility</div>
                        <div className="ref-visibility-subtitle">Show the referral program to your Affiliates</div>
                      </div>
                      <button
                        type="button"
                        className={`ref-toggle ${summary.affiliateDashboardVisible ? "on" : ""}`}
                        onClick={toggleVisibility}
                        disabled={savingVisibility}
                        aria-pressed={summary.affiliateDashboardVisible}
                      >
                        <span className="ref-toggle-knob" />
                      </button>
                    </div>

                    <div className="ref-info-banner">
                      <span aria-hidden="true">ⓘ</span>
                      <div>
                        <div className="ref-info-title">For your referral bonus please reach out to your Account Manager</div>
                        <div className="ref-info-subtitle">The referral bonus is processed manually after verifying the details on our end</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!loading && summary && activeTab === "Billing" && (
              <div className="ref-billing-section">
                <div className="ref-stats">
                  <div className="ref-stat-card">
                    <span className="ref-stat-icon">✓</span>
                    <div>
                      <div className="ref-stat-label">Paid Amount</div>
                      <div className="ref-stat-value">{formatUsd(summary.paidAmount)}</div>
                    </div>
                  </div>
                  <div className="ref-stat-card">
                    <span className="ref-stat-icon">⏳</span>
                    <div>
                      <div className="ref-stat-label">Due Amount</div>
                      <div className="ref-stat-value">{formatUsd(summary.dueAmount)}</div>
                    </div>
                  </div>
                </div>
                <p className="ref-message">No payout history yet</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
