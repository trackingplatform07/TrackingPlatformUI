import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/PostbackPage.css";

const POSTBACK_TYPES = ["S2S", "Pixel", "iframe", "Google Tag Manager", "Web SDK", "iGaming"];

const TOKEN_COLUMNS = ["AdvSub1", "AdvSub4", "Payout", "AdvSub2", "AdvSub5", "Currency", "AdvSub3", "Sale", "Event"];

const MOBILE_ATTRIBUTION_INTEGRATIONS = [
  { key: "offer18", name: "Offer18 (SDK)", logoClass: "logo-offer18", buttons: [{ label: "Android", icon: "📱" }, { label: "iOS (comming soon)", icon: "🍎", disabled: true }] },
  { key: "appsflyer", name: "Appsflyer", logoClass: "logo-appsflyer", buttons: [{ label: "Setup", icon: "+" }, { label: "Read", icon: "📖" }] },
  { key: "singular", name: "Singular", logoClass: "logo-singular", buttons: [{ label: "Setup", icon: "+" }, { label: "Read", icon: "📖" }] },
  { key: "branch", name: "Branch", logoClass: "logo-branch", buttons: [{ label: "Setup", icon: "+" }, { label: "Read", icon: "📖" }] },
  { key: "adjust", name: "Adjust", logoClass: "logo-adjust", buttons: [{ label: "Setup", icon: "+" }, { label: "Read", icon: "📖" }] },
  { key: "kochava", name: "Kochava", logoClass: "logo-kochava", buttons: [{ label: "Setup", icon: "+" }] },
];

const ADVERTISER_ECOMMERCE_INTEGRATIONS = [
  { key: "shopify", name: "Shopify", logoClass: "logo-shopify", buttons: [{ label: "Setup", icon: "+" }] },
  { key: "woocommerce", name: "WooCommerce", logoClass: "logo-woocommerce", buttons: [{ label: "Setup", icon: "+" }] },
];

const AFFILIATE_INTEGRATIONS = [
  { key: "facebook", name: "Facebook", logoClass: "logo-facebook", buttons: [{ label: "Setup", icon: "+" }] },
  { key: "google-ads", name: "Google Ads", logoClass: "logo-google-ads", buttons: [{ label: "Setup", icon: "+" }] },
];

const webSdkSnippet = (offerId) => `<script>
    window.Offer18WebSDK.trackConversion({
        domain: 'demo40.o18.click',
        accountId: '4860',
        offerId: ${offerId},
        coupon:'',
        postbackType: '', // 'iframe' or 'pixel'
        isGlobalPixel: false, // true or false
        allowMultiConversion: false, // true or false
        conversionData: {
            adv_sub1: '{REPLACE}',
        }
    });
</script>`;

export default function PostbackPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [postbackOfferId, setPostbackOfferId] = useState("");
  const [postbackEventsOnly, setPostbackEventsOnly] = useState(false);
  const [postbackType, setPostbackType] = useState("Web SDK");
  const [postbackUrlCopied, setPostbackUrlCopied] = useState(false);
  const [postbackTokens, setPostbackTokens] = useState({
    ClickID: true,
    AdvSub1: true,
    AdvSub2: false,
    AdvSub3: false,
    AdvSub4: true,
    AdvSub5: false,
    Sale: false,
    Payout: false,
    Currency: false,
    Event: false,
  });
  const [postbackSelectionMode, setPostbackSelectionMode] = useState("advertiser");
  const [advertisers, setAdvertisers] = useState([]);
  const [advertisersLoading, setAdvertisersLoading] = useState(true);
  const [postbackAdvertiserId, setPostbackAdvertiserId] = useState("");
  const [showMobileAttributionModal, setShowMobileAttributionModal] = useState(false);

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
        const offerItems = Array.isArray(data) ? data : data.items || data.data || [];
        setOffers(offerItems);
      } catch (error) {
        if (error.name !== "AbortError") setOffers([]);
      } finally {
        if (!controller.signal.aborted) setOffersLoading(false);
      }
    };

    loadOffers();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadAdvertisers = async () => {
      try {
        setAdvertisersLoading(true);
        const response = await fetch("https://localhost:7129/api/Advertisers", {
          headers: { accept: "*/*" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load advertisers");
        const data = await response.json();
        const advertiserItems = Array.isArray(data) ? data : data.items || data.data || [];
        setAdvertisers(advertiserItems);
      } catch (error) {
        if (error.name !== "AbortError") setAdvertisers([]);
      } finally {
        if (!controller.signal.aborted) setAdvertisersLoading(false);
      }
    };

    loadAdvertisers();
    return () => controller.abort();
  }, []);

  const selectedOffer = offers.find((offer) => String(offer.id) === String(postbackOfferId));
  const selectedAdvertiser = advertisers.find((advertiser) => String(advertiser.id) === String(postbackAdvertiserId));
  const advertiserName = (advertiser) =>
    [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || "Unnamed Advertiser";

  const switchSelectionMode = () => {
    setPostbackSelectionMode((current) => (current === "advertiser" ? "offer" : "advertiser"));
  };

  const postbackUrl = postbackSelectionMode === "offer" && postbackOfferId
    ? postbackType === "Web SDK"
      ? webSdkSnippet(postbackOfferId)
      : `https://demo40.o18.click/p?o=${postbackOfferId}&m=4860&tid={REPLACE}`
    : `https://demo40.o18.click/p?m=4860&tid={REPLACE}`;

  const togglePostbackToken = (key) => {
    setPostbackTokens((current) => ({ ...current, [key]: !current[key] }));
  };

  const copyPostbackUrl = async () => {
    if (!postbackUrl) return;
    try {
      await navigator.clipboard.writeText(postbackUrl);
      setPostbackUrlCopied(true);
      window.setTimeout(() => setPostbackUrlCopied(false), 2000);
    } catch {
      setPostbackUrlCopied(false);
    }
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="postback-page">
          <section className="postback-page-card">
            <header className="postback-header">
              <h2><span aria-hidden="true">🖼</span> Postback</h2>
              <div className="postback-header-actions">
                <button type="button" className="events-dark-btn" onClick={() => setShowMobileAttributionModal(true)}>📱 Mobile Attribution / Integration</button>
                <button type="button" className="events-dark-btn" onClick={switchSelectionMode}>
                  {postbackSelectionMode === "advertiser" ? <>📄 Select Offer</> : <>👤 Select Advertiser</>}
                </button>
              </div>
            </header>

            {postbackSelectionMode === "advertiser" ? (
              <div className="capping-field">
                <label>Select Advertiser</label>
                {postbackAdvertiserId ? (
                  <span className="ctit-chip postback-offer-chip">
                    {selectedAdvertiser ? `${selectedAdvertiser.id} ~ ${advertiserName(selectedAdvertiser)}` : postbackAdvertiserId}
                    <button type="button" onClick={() => setPostbackAdvertiserId("")} aria-label="Clear advertiser">×</button>
                  </span>
                ) : (
                  <select value={postbackAdvertiserId} onChange={(event) => setPostbackAdvertiserId(event.target.value)} disabled={advertisersLoading}>
                    <option value="">{advertisersLoading ? "Loading advertisers…" : "Select Advertiser"}</option>
                    {advertisers.map((advertiser) => <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {advertiserName(advertiser)}</option>)}
                  </select>
                )}
              </div>
            ) : (
              <div className="capping-field">
                <label>Select Offer</label>
                {postbackOfferId ? (
                  <span className="ctit-chip postback-offer-chip">
                    {selectedOffer ? `${selectedOffer.id} ~ ${selectedOffer.offerName}` : postbackOfferId}
                    <button type="button" onClick={() => setPostbackOfferId("")} aria-label="Clear offer">×</button>
                  </span>
                ) : (
                  <select value={postbackOfferId} onChange={(event) => setPostbackOfferId(event.target.value)} disabled={offersLoading}>
                    <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                    {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                  </select>
                )}
              </div>
            )}

            <label className="automation-checkbox postback-events-checkbox">
              <input type="checkbox" checked={postbackEventsOnly} onChange={(event) => setPostbackEventsOnly(event.target.checked)} />
              Events Postback:
            </label>

            <div className="capping-field">
              <label>Postback Type</label>
              <div className="postback-type-options">
                {POSTBACK_TYPES.map((type) => (
                  <label className="postback-type-radio" key={type}>
                    <input type="radio" name="postbackType" checked={postbackType === type} onChange={() => setPostbackType(type)} />
                    {type}
                    {type === "iGaming" && <span className="postback-new-badge">New</span>}
                  </label>
                ))}
              </div>
            </div>

            <div className="capping-field">
              <label>Postback URL</label>
              <div className="postback-url-box">
                <div className="postback-url-meta">
                  {postbackSelectionMode === "offer" && postbackOfferId ? `Offer ID - ${postbackOfferId}` : "Global Postback"}
                </div>
                <div className="postback-url-divider" />
                <pre className="postback-url-text">{postbackUrl}</pre>
                <button type="button" className="postback-copy-btn" onClick={copyPostbackUrl} title={postbackUrlCopied ? "Copied!" : "Copy"}>{postbackUrlCopied ? "✓" : "📋"}</button>
              </div>
            </div>

            <div className="postback-android-row">
              <button type="button" className="postback-android-btn" onClick={() => alert("Android SDK is not connected yet.")}>📱 Android SDK</button>
            </div>

            <div className="postback-ip-note">
              <span aria-hidden="true">ⓘ</span> Avoid unauthenticated Conversions by whitelisting Postback IP . <a href="#" onClick={(event) => event.preventDefault()}>know more</a>
            </div>

            <div className="postback-tokens-grid postback-tokens-grid-columnar">
              <label className="postback-token-row postback-token-clickid">
                <input type="checkbox" checked={postbackTokens.ClickID} onChange={() => togglePostbackToken("ClickID")} />
                ClickID
                <select onChange={(event) => event.stopPropagation()}>
                  <option>Select Partner</option>
                </select>
                <span className="postback-token-placeholder">{"{REPLACE}"}</span>
              </label>
              {TOKEN_COLUMNS.map((token) => (
                <label className="postback-token-row" key={token}>
                  <input type="checkbox" checked={postbackTokens[token]} onChange={() => togglePostbackToken(token)} />
                  {token}
                  <span className="postback-token-placeholder">{"{REPLACE}"}</span>
                </label>
              ))}
            </div>
          </section>
        </main>
      </div>

      {showMobileAttributionModal && (
        <div className="modal-overlay" onClick={() => setShowMobileAttributionModal(false)}>
          <section className="mobile-attribution-modal" onClick={(event) => event.stopPropagation()} aria-label="Mobile attribution and integrations">
            <button type="button" className="mobile-attribution-close" onClick={() => setShowMobileAttributionModal(false)} aria-label="Close">×</button>

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

            <h3 className="mobile-attribution-section-title">Affiliate Integration</h3>
            <div className="mobile-attribution-grid">
              {AFFILIATE_INTEGRATIONS.map((integration) => (
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
          </section>
        </div>
      )}
    </div>
  );
}
