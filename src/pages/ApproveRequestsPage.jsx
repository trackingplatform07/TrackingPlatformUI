import React, { useEffect, useState } from "react";
import { FaFilter, FaSync, FaUsers } from "react-icons/fa";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ApproveRequestsPage.css";

export default function ApproveRequestsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(true);
  const [assignOfferId, setAssignOfferId] = useState("");
  const [assignAffiliateId, setAssignAffiliateId] = useState("");
  const [assignDecision, setAssignDecision] = useState("approve");

  useEffect(() => {
    const controller = new AbortController();

    const loadOffers = async () => {
      try {
        setOffersLoading(true);
        const response = await fetch("https://localhost:7150/api/Offers", {
          headers: { accept: "*/*" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load offers");
        const data = await response.json();
        setOffers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setOffers([]);
      } finally {
        if (!controller.signal.aborted) setOffersLoading(false);
      }
    };

    loadOffers();
    return () => controller.abort();
  }, [refreshKey]);

  useEffect(() => {
    const controller = new AbortController();

    const loadAffiliates = async () => {
      try {
        setAffiliatesLoading(true);
        const response = await fetch("https://localhost:7029/api/Affiliates", {
          headers: { accept: "*/*" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load affiliates");
        const data = await response.json();
        setAffiliates(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setAffiliates([]);
      } finally {
        if (!controller.signal.aborted) setAffiliatesLoading(false);
      }
    };

    loadAffiliates();
    return () => controller.abort();
  }, [refreshKey]);

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

  const filteredRequests = requests.filter((request) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [request.offerId, request.advertiser, request.affiliate].some((value) => String(value || "").toLowerCase().includes(term));
  });

  const submitAssignment = () => {
    if (!assignOfferId) {
      alert("Please select an offer.");
      return;
    }
    if (!assignAffiliateId) {
      alert("Please select an affiliate.");
      return;
    }

    const offer = offers.find((item) => String(item.id) === String(assignOfferId));
    const affiliate = affiliates.find((item) => String(item.id) === String(assignAffiliateId));

    setRequests((current) => [...current, {
      id: Date.now(),
      offerId: offer ? `${offer.id} ~ ${offer.offerName}` : assignOfferId,
      advertiser: offer?.advertiser || "-",
      affiliate: affiliate ? affiliateName(affiliate) : assignAffiliateId,
      status: assignDecision === "approve" ? "Approved" : "Rejected",
    }]);

    setAssignOfferId("");
    setAssignAffiliateId("");
    setAssignDecision("approve");
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="approve-requests-page">
          <section className="approve-requests-list-card">
            <div className="approve-requests-toolbar">
              <h1><FaUsers /> Manage Offer Requests <button type="button" className="approve-requests-refresh" onClick={() => setRefreshKey((value) => value + 1)} aria-label="Refresh"><FaSync /></button></h1>
              <div className="approve-requests-actions">
                <button type="button" className="approve-requests-filter"><FaFilter /> Filters</button>
              </div>
            </div>

            <div className="approve-requests-search-row">
              <label>Search:
                <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search offer requests" />
              </label>
            </div>

            <div className="approve-requests-table-scroll">
              <table className="approve-requests-table">
                <thead>
                  <tr>
                    <th><span aria-hidden="true">◎</span> OfferID</th>
                    <th><span aria-hidden="true">👤</span> Advertiser</th>
                    <th><span aria-hidden="true">👤</span> Affiliate</th>
                    <th><span aria-hidden="true">⚙</span> Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 && (
                    <tr><td colSpan="4" className="approve-requests-empty">No Data available</td></tr>
                  )}
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.offerId}</td>
                      <td>{request.advertiser}</td>
                      <td>{request.affiliate}</td>
                      <td>{request.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="assign-offers-card">
            <h2><span aria-hidden="true">+</span> Assign Offers to Affiliates</h2>

            <div className="assign-offers-field">
              <label>Select Offer</label>
              <select value={assignOfferId} onChange={(event) => setAssignOfferId(event.target.value)} disabled={offersLoading}>
                <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
              </select>
            </div>

            <div className="assign-offers-field">
              <label>Select Affiliate</label>
              <select value={assignAffiliateId} onChange={(event) => setAssignAffiliateId(event.target.value)} disabled={affiliatesLoading}>
                <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
              </select>
            </div>

            <div className="assign-offers-decision-row">
              <label className="assign-offers-radio">
                <input type="radio" name="assignDecision" checked={assignDecision === "approve"} onChange={() => setAssignDecision("approve")} />
                Approve
              </label>
              <label className="assign-offers-radio">
                <input type="radio" name="assignDecision" checked={assignDecision === "reject"} onChange={() => setAssignDecision("reject")} />
                Reject
              </label>
              <button type="button" className="assign-offers-submit" onClick={submitAssignment}>
                <span aria-hidden="true">🕐</span> Submit
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
