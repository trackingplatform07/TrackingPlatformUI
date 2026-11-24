import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/CreateInvoice.css";
import { TIMEZONES, useCurrencies } from "../data/billingOptions";

const ADVERTISERS_API = "https://localhost:7129/api/Advertisers";
const OFFERS_API = "https://localhost:7150/api/Offers";

const toList = (data) => (Array.isArray(data) ? data : data?.items || data?.data || []);

const advertiserLabel = (advertiser) =>
  [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || advertiser.email || `Advertiser ${advertiser.id}`;

const CreateInvoice = () => {

  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const currencies = useCurrencies();
  const [currency, setCurrency] = useState("");
  const [timezone, setTimezone] = useState("");

  const [advertisers, setAdvertisers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [listsError, setListsError] = useState("");
  const [advertiserId, setAdvertiserId] = useState("");
  const [offerIds, setOfferIds] = useState([]);
  const [offersOpen, setOffersOpen] = useState(false);
  const [offerSearch, setOfferSearch] = useState("");
  const offersRef = useRef(null);

  // advertisers and offers for the dropdowns
  useEffect(() => {
    const controller = new AbortController();
    const load = (url) => fetch(url, { headers: { accept: "*/*" }, signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load");
        return response.json();
      })
      .then(toList);

    Promise.all([load(ADVERTISERS_API), load(OFFERS_API)])
      .then(([advertiserList, offerList]) => {
        setAdvertisers(advertiserList.filter((advertiser) => advertiser.isActive !== false));
        setOffers(offerList.filter((offer) => offer.isActive !== false));
      })
      .catch((error) => {
        if (error.name !== "AbortError") setListsError("Unable to load advertisers / offers. Please try again.");
      });

    return () => controller.abort();
  }, []);

  // close the offers list on an outside click
  useEffect(() => {
    if (!offersOpen) return undefined;
    const close = (event) => {
      if (offersRef.current && !offersRef.current.contains(event.target)) setOffersOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [offersOpen]);

  // offers of the chosen advertiser (all offers until one is chosen)
  const advertiserOffers = advertiserId
    ? offers.filter((offer) => String(offer.advertiserId) === advertiserId)
    : offers;
  const term = offerSearch.trim().toLowerCase();
  const shownOffers = term
    ? advertiserOffers.filter((offer) => `${offer.id} ${offer.offerName || ""}`.toLowerCase().includes(term))
    : advertiserOffers;
  const selectedOffers = offers.filter((offer) => offerIds.includes(offer.id));

  const changeAdvertiser = (value) => {
    setAdvertiserId(value);
    // keep only the offers that belong to the new advertiser
    setOfferIds((current) => current.filter((id) => !value || offers.some((offer) => offer.id === id && String(offer.advertiserId) === value)));
  };

  const toggleOffer = (id) => {
    setOfferIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <div className="of-layout">

      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="of-main">

        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="invoice-page">

          {/* Header */}
          <div className="invoice-header">
            <h2>Create Invoice</h2>
            <button type="button" className="btn small invoice-list-btn" onClick={() => navigate("/advertisers-billing")}>
              <span aria-hidden="true">☰</span> Invoices
            </button>
          </div>

          {/* Form */}
          <div className="invoice-box">

            {listsError && <div className="inv-lists-error">{listsError}</div>}

            <div className="form-grid">

              <div className="form-group">
                <label>Advertiser</label>
                <select value={advertiserId} onChange={(event) => changeAdvertiser(event.target.value)}>
                  <option value="">Select Advertiser</option>
                  {advertisers.map((advertiser) => (
                    <option key={advertiser.id} value={String(advertiser.id)}>{advertiser.id} ~ {advertiserLabel(advertiser)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
                  <option value="">Select Currency</option>
                  {currencies.map((item) => (
                    <option key={item.code} value={item.code}>{item.code} - {item.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select value={timezone} onChange={(event) => setTimezone(event.target.value)}>
                  <option value="">Select Timezone</option>
                  {TIMEZONES.map((zone) => (
                    <option key={zone.value} value={zone.value}>{zone.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Reports Period</label>
                <div className="flex">
                  <input type="date" defaultValue="2026-02-01" />
                  <input type="date" defaultValue="2026-02-28" />
                </div>
              </div>

              <div className="form-group">
                <label>Offers</label>
                <div className="inv-multi" ref={offersRef}>
                  <button
                    type="button"
                    className={`inv-multi-field ${offersOpen ? "is-open" : ""}`}
                    onClick={() => setOffersOpen((open) => !open)}
                    aria-expanded={offersOpen}
                  >
                    <span className={selectedOffers.length ? "" : "inv-multi-placeholder"}>
                      {selectedOffers.length === 0 && "Select Offer"}
                      {selectedOffers.length === 1 && `${selectedOffers[0].id} - ${selectedOffers[0].offerName}`}
                      {selectedOffers.length > 1 && `${selectedOffers.length} offers selected`}
                    </span>
                  </button>

                  {offersOpen && (
                    <div className="inv-multi-menu">
                      <input
                        className="inv-multi-search"
                        value={offerSearch}
                        onChange={(event) => setOfferSearch(event.target.value)}
                        placeholder="Search offers..."
                        autoFocus
                      />
                      <div className="inv-multi-list">
                        {shownOffers.length === 0 && (
                          <div className="inv-multi-empty">
                            {advertiserId ? "No offers for this advertiser" : "No offers found"}
                          </div>
                        )}
                        {shownOffers.map((offer) => (
                          <label key={offer.id} className="inv-multi-option">
                            <input type="checkbox" checked={offerIds.includes(offer.id)} onChange={() => toggleOffer(offer.id)} />
                            <span>{offer.id} - {offer.offerName || "Untitled offer"}</span>
                          </label>
                        ))}
                      </div>
                      {offerIds.length > 0 && (
                        <button type="button" className="inv-multi-clear" onClick={() => setOfferIds([])}>Clear selection</button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Item Group</label>
                <select>
                  <option>Total Amount</option>
                </select>
              </div>

            </div>

            <div className="form-footer">
              <button className="btn primary">Fetch Reports</button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CreateInvoice;