import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListOl,
  FaListUl,
  FaQuoteRight,
  FaUndo,
  FaRedo,
  FaLink,
  FaUnlink,
  FaImage,
  FaTable,
  FaAlignLeft,
  FaLock,
  FaUserTie,
  FaMagic,
} from "react-icons/fa";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/CreateOfferPage.css";

const editorTabs = [
  { id: "offerDescription", label: "Offer Description", icon: FaTable },
  { id: "privateNote", label: "Private Note", icon: FaLock },
  { id: "paOfferTerms", label: "Offer Terms/KPI", icon: FaUserTie },
];

const targetingOptions = {
  Country: ["Australia", "Brazil", "Canada", "France", "Germany", "India", "Japan", "United Kingdom", "United States"],
  OS: ["Android", "Chrome OS", "iOS", "Linux", "macOS", "Windows"],
  Browser: ["Chrome", "Edge", "Firefox", "Opera", "Safari", "Samsung Internet"],
  "Device Type": ["Desktop", "Mobile", "Smart TV", "Tablet"],
  ISP: ["Airtel", "AT&T", "Comcast", "Jio", "T-Mobile", "Verizon", "Vodafone"],
};

const targetingConditionTypes = Object.keys(targetingOptions);

const createTargetingRule = (id, name = "") => ({
  id,
  name,
  enabled: true,
  actions: { clicks: "none", conversions: "none", impressions: "none" },
  conditions: targetingConditionTypes.map((type) => ({ type, operator: "equal", value: "" })),
  affiliateVisibility: "show",
});

const targetingRuleFromApi = (rule) => ({
  id: Date.now(),
  serverId: rule.id,
  name: rule.ruleName || "",
  enabled: rule.enabled !== false,
  actions: {
    clicks: rule.actionOnClicks || "none",
    conversions: rule.actionOnConversions || "none",
    impressions: rule.actionOnImpressions || "none",
  },
  conditions: [
    { type: "Country", operator: "equal", value: rule.country || "" },
    { type: "OS", operator: "equal", value: rule.os || "" },
    { type: "Browser", operator: "equal", value: rule.browser || "" },
    { type: "Device Type", operator: "equal", value: rule.deviceType || "" },
    { type: "ISP", operator: "equal", value: rule.isp || "" },
  ],
  affiliateVisibility: rule.affiliateVisibility || "show",
  createdOn: rule.createdOn,
  createdBy: rule.createdBy,
  isActive: rule.isActive !== false,
});

function RichTextOfferEditor({ formData, setFormData }) {
  const [activeTab, setActiveTab] = useState("offerDescription");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: formData.offerDescription,
    editorProps: {
      attributes: {
        class: "offer-rich-text-content",
        "aria-label": "Offer description editor",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setFormData((previous) => ({
        ...previous,
        [activeTab]: currentEditor.getHTML(),
      }));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const nextContent = formData[activeTab] || "";
    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [activeTab, editor, formData]);

  const selectTab = (tabId) => {
    if (editor) {
      setFormData((previous) => ({
        ...previous,
        [activeTab]: editor.getHTML(),
      }));
    }
    setActiveTab(tabId);
  };

  const setLink = () => {
    const url = window.prompt("Paste the link URL");
    if (url) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="offer-rich-text" aria-label="Offer information editor">
      <div className="offer-editor-tabs" role="tablist" aria-label="Offer information tabs">
        {editorTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`offer-editor-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => selectTab(tab.id)}
          >
            {React.createElement(tab.icon, { "aria-hidden": true })}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="offer-editor-shell">
        <div className="offer-editor-toolbar" role="toolbar" aria-label="Text formatting">
          <button type="button" title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><FaUndo /></button>
          <button type="button" title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><FaRedo /></button>
          <span className="toolbar-divider" />
          <button type="button" title="Numbered list" className={editor.isActive("orderedList") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleOrderedList().run()}><FaListOl /></button>
          <button type="button" title="Bulleted list" className={editor.isActive("bulletList") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleBulletList().run()}><FaListUl /></button>
          <button type="button" title="Quote" className={editor.isActive("blockquote") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleBlockquote().run()}><FaQuoteRight /></button>
          <span className="toolbar-divider" />
          <button type="button" title="Bold" className={editor.isActive("bold") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleBold().run()}><FaBold /></button>
          <button type="button" title="Italic" className={editor.isActive("italic") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleItalic().run()}><FaItalic /></button>
          <button type="button" title="Underline" className={editor.isActive("underline") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleUnderline().run()}><FaUnderline /></button>
          <button type="button" title="Strikethrough" className={editor.isActive("strike") ? "is-active" : ""} onClick={() => editor.chain().focus().toggleStrike().run()}><FaStrikethrough /></button>
          <span className="toolbar-divider" />
          <button type="button" title="Add link" onClick={setLink}><FaLink /></button>
          <button type="button" title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")}><FaUnlink /></button>
          <button type="button" title="Image uploads are not configured" disabled><FaImage /></button>
          <button type="button" title="Table support is not configured" disabled><FaTable /></button>
          <button type="button" title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()}><FaAlignLeft /></button>
          <span className="toolbar-divider" />
          <select
            aria-label="Styles"
            value={editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "paragraph"}
            onChange={(event) => {
              const command = editor.chain().focus();
              event.target.value === "paragraph" ? command.setParagraph().run() : command.toggleHeading({ level: Number(event.target.value.slice(1)) }).run();
            }}
          >
            <option value="paragraph">Styles</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
          <select aria-label="Format" defaultValue="format" onChange={(event) => event.target.value === "clear" && editor.chain().focus().clearNodes().unsetAllMarks().run()}>
            <option value="format">Format</option>
            <option value="clear">Clear formatting</option>
          </select>
        </div>
        <EditorContent editor={editor} />
        <div className="offer-editor-status">
          <button type="button" className="ai-rewrite-button" title="AI rewrite can be connected when an AI service is available"><FaMagic /> AI Rewrite</button>
        </div>
      </div>
    </div>
  );
}

function WizardStepFooter({ onPrevious, onNext }) {
  return (
    <div className="wizard-step-footer">
      <button type="button" className="btn secondary" onClick={onPrevious}>Previous</button>
      <button type="button" className="btn primary" onClick={onNext}>Submit &amp; Next Set Targeting</button>
    </div>
  );
}

export default function CreateOfferPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const navigate = useNavigate();
  const [affiliateRandomUrl, setAffiliateRandomUrl] = useState(false);
  const [showLandingPageModal, setShowLandingPageModal] = useState(false);
  const [showTrackingUrlModal, setShowTrackingUrlModal] = useState(false);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [trackingOffer, setTrackingOffer] = useState("");
  const [trackingAffiliate, setTrackingAffiliate] = useState("");
  const [trackingOptions, setTrackingOptions] = useState({ impression: false, description: true, qrCode: false, additionalTokens: true, landingPages: false, preLandingPages: false, defaultTokens: false, googleAds: false, shortUrl: false, shortUrlParams: false });
  const [landingPageForm, setLandingPageForm] = useState({
    name: "", type: "Landing", targeting: "", url: "", affiliateMode: "Allow", affiliate: "", weight: "10", visibility: "Show", description: "", fallback: false,
    subUrls: [{ name: "", url: "", weight: "" }], enabled: true,
  });
  const [landingPages, setLandingPages] = useState([
    { id: "", name: "default_url", type: "default", url: "test", targeting: "", affiliate: "", weight: "", updatedAt: "", status: "" },
  ]);
  const [editingLandingPageId, setEditingLandingPageId] = useState(null);
  const [landingPagesLoading, setLandingPagesLoading] = useState(false);
  const [landingPageActionId, setLandingPageActionId] = useState(null);
  const [landingPageSaving, setLandingPageSaving] = useState(false);
  const [targetingRules, setTargetingRules] = useState([]);
  const [targetingRuleSavingId, setTargetingRuleSavingId] = useState(null);
  const [targetingRuleError, setTargetingRuleError] = useState("");
  const [createdOfferId, setCreatedOfferId] = useState(0);
  const [selectedTargetingLandingPage, setSelectedTargetingLandingPage] = useState(null);
  const [countryOptions, setCountryOptions] = useState(targetingOptions.Country);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [creativeUploadType, setCreativeUploadType] = useState("");
  const [creativeFileName, setCreativeFileName] = useState("");
  const [creativeFile, setCreativeFile] = useState(null);
  const [creativeTitle, setCreativeTitle] = useState("");
  const [creatives, setCreatives] = useState([]);
  const [creativesLoading, setCreativesLoading] = useState(false);
  const [creativeSaving, setCreativeSaving] = useState(false);
  const [creativeError, setCreativeError] = useState("");
  const [creativeMessage, setCreativeMessage] = useState("");
  const [creativeDeletingId, setCreativeDeletingId] = useState(null);
  const [affiliateSearch, setAffiliateSearch] = useState("");
  const [advertiserDropdownOpen, setAdvertiserDropdownOpen] = useState(false);
  const [advertiserSearch, setAdvertiserSearch] = useState("");
  const [advertisersLoading, setAdvertisersLoading] = useState(true);
  const [advertisersError, setAdvertisersError] = useState("");
  const [offerAffiliates, setOfferAffiliates] = useState([
    { id: 1, initials: "TI", color: "#a868f5", offer: "22009958 - test", affiliate: "565890 - test test (test)" },
    { id: 2, initials: "NA", color: "#57528e", offer: "22009958 - test", affiliate: "311875 - New Affiliate (Affiliate)" },
    { id: 3, initials: "TA", color: "#fb6191", offer: "22009958 - test", affiliate: "122115 - Test Affiliate 1" },
  ]);

  const [formData, setFormData] = useState({
    // General Step 1
    offerType: "General",
    offerName: "",
    uploadLogo: null,
    advertiser: "",
    offerCategory: "",
    appId: "",
    externalOfferId: "",
    offerPreviewUrl: "",
    offerUrl: "",
    advertiserUrlBuilder: "",
    landingPage: "",
    tokens: "",
    
    // Advertiser Pricing
    advertiserModel: "",
    advertiserPrice: "0",
    advertiserCurrency: "",
    
    // Affiliate Pricing
    affiliateModel: "",
    affiliatePrice: "0",
    affiliateCurrency: "",
    hidePayout: false,
    
    // Schedule
    startDate: "2026-08-16T13:00",
    endDate: "2028-08-16T13:00",
    dailyStartTime: "00:00:00",
    dailyEndTime: "00:00:00",
    dailyScheduleEnabled: false,
    
    // Offer Settings
    offerVisibility: "Public",
    status: "Approve",
    alertToAffiliates: false,
    deepLinks: false,
    terms: "", 
    offerDescription: "",
    privateNote: "",
    paOfferTerms: "",
    styles: "",
  });

  const [advertisers, setAdvertisers] = useState([]);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [currenciesError, setCurrenciesError] = useState("");
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(false);

  const [showAdvertiserModal, setShowAdvertiserModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newAdvertiser, setNewAdvertiser] = useState("");
  const [newCategoryRows, setNewCategoryRows] = useState([""]);
  const [editedCategoryIds, setEditedCategoryIds] = useState([]);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryActionError, setCategoryActionError] = useState("");
  const [offerSaving, setOfferSaving] = useState(false);
  const [offerSaveError, setOfferSaveError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadAdvertisers = async () => {
      try {
        setAdvertisersLoading(true);
        setAdvertisersError("");
        const response = await fetch("https://localhost:7129/api/Advertisers", {
          headers: { accept: "*/*" },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Unable to load advertisers");

        const data = await response.json();
        setAdvertisers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setAdvertisers([]);
          setAdvertisersError("Unable to load advertisers");
        }
      } finally {
        if (!controller.signal.aborted) setAdvertisersLoading(false);
      }
    };

    loadAdvertisers();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!showLandingPageModal && !showTrackingUrlModal) return;
    const controller = new AbortController();

    const loadAffiliates = async () => {
      try {
        setAffiliatesLoading(true);
        const token = JSON.parse(localStorage.getItem("user"))?.token;
        const response = await fetch("https://localhost:7029/api/Affiliates", {
          headers: { Accept: "*/*", Authorization: token ? `Bearer ${token}` : "" },
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
  }, [showLandingPageModal, showTrackingUrlModal]);

  useEffect(() => {
    if (!showTrackingUrlModal) return;
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
        setTrackingOffer((current) => current || String(offerItems[0]?.id || ""));
      } catch (error) {
        if (error.name !== "AbortError") setOffers([]);
      } finally {
        if (!controller.signal.aborted) setOffersLoading(false);
      }
    };

    loadOffers();
    return () => controller.abort();
  }, [showTrackingUrlModal]);

  useEffect(() => {
    const controller = new AbortController();

    const loadCurrencies = async () => {
      try {
        setCurrenciesLoading(true);
        setCurrenciesError("");
        const response = await fetch("https://api.frankfurter.dev/v2/rates?base=USD", { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load currencies");

        const rates = await response.json();
        const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });
        const codes = [...new Set(["USD", ...rates.map((rate) => rate.quote)])].sort();
        setCurrencies(codes.map((code) => ({
          code,
          name: currencyNames.of(code) || code,
        })));
      } catch (error) {
        if (error.name !== "AbortError") {
          setCurrencies([]);
          setCurrenciesError("Unable to load currencies");
        }
      } finally {
        if (!controller.signal.aborted) setCurrenciesLoading(false);
      }
    };

    loadCurrencies();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");
        const response = await fetch("https://localhost:7150/api/OfferCategories", {
          headers: { accept: "*/*" },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Unable to load offer categories");

        const data = await response.json();
        setCategories((Array.isArray(data) ? data : data.items || data.data || []).filter((category) => category.isActive !== false));
      } catch (error) {
        if (error.name !== "AbortError") {
          setCategories([]);
          setCategoriesError("Unable to load categories");
        }
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      }
    };

    loadCategories();
    return () => controller.abort();
  }, []);

  const advertiserName = (advertiser) =>
    [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || "Unnamed Advertiser";

  const advertiserInitials = (advertiser) =>
    advertiserName(advertiser).split(" ").filter(Boolean).slice(0, 2).map((name) => name[0]).join("").toUpperCase();

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || affiliate.email || "Unnamed Affiliate";

  const selectedTrackingOffer = offers.find((offer) => String(offer.id) === String(trackingOffer));

  const selectedAdvertiser = advertisers.find((advertiser) => String(advertiser.id) === String(formData.advertiser));
  const filteredAdvertisers = advertisers.filter((advertiser) => {
    const searchText = `${advertiser.id} ${advertiserName(advertiser)} ${advertiser.companyName || ""}`.toLowerCase();
    return searchText.includes(advertiserSearch.trim().toLowerCase());
  });

  const selectAdvertiser = (advertiser) => {
    setFormData((previous) => ({ ...previous, advertiser: String(advertiser.id) }));
    setAdvertiserSearch("");
    setAdvertiserDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      uploadLogo: e.target.files[0],
    }));
  };

  const updateTargetingRule = (ruleId, update) => {
    setTargetingRules((rules) => rules.map((rule) =>
      rule.id === ruleId ? { ...rule, ...update } : rule
    ));
  };

  const updateTargetingCondition = (ruleId, conditionIndex, update) => {
    setTargetingRules((rules) => rules.map((rule) => {
      if (rule.id !== ruleId) return rule;
      return {
        ...rule,
        conditions: rule.conditions.map((condition, index) =>
          index === conditionIndex ? { ...condition, ...update } : condition
        ),
      };
    }));
  };

  const openTargetingRuleEditor = async (landingPage = null) => {
    let page = landingPage || { id: null, offerId: createdOfferId, name: "" };
    let rule = null;
    if (landingPage?.id) {
      try {
        const response = await fetch(`https://localhost:7150/api/TargetingRules/${landingPage.id}`, { headers: { accept: "*/*" } });
        if (response.ok) {
          rule = await response.json();
          page = { ...landingPage, offerId: rule.offerId ?? landingPage.offerId, name: rule.ruleName || landingPage.name };
        }
      } catch {
        // A new rule can still be created from the selected card.
      }
    }

    setSelectedTargetingLandingPage(page);
    setTargetingRules([rule ? targetingRuleFromApi(rule) : createTargetingRule(Date.now(), page.name || "")]);
    setTargetingRuleError("");
  };

  const submitTargetingRule = async (rule) => {
    if (!rule.name.trim()) {
      setTargetingRuleError("Enter a rule name before submitting.");
      return;
    }

    const valuesFor = (type) => rule.conditions
      .filter((condition) => condition.type === type && condition.value)
      .map((condition) => condition.value)
      .join(",");
    const now = new Date().toISOString();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const payload = {
      id: 0,
      offerId: Number(selectedTargetingLandingPage?.offerId ?? createdOfferId) || 0,
      ruleName: rule.name.trim(),
      country: valuesFor("Country"),
      os: valuesFor("OS"),
      browser: valuesFor("Browser"),
      deviceType: valuesFor("Device Type"),
      isp: valuesFor("ISP"),
      actionOnClicks: rule.actions.clicks,
      actionOnConversions: rule.actions.conversions,
      actionOnImpressions: rule.actions.impressions,
      affiliateVisibility: rule.affiliateVisibility,
      enabled: rule.enabled,
      createdOn: rule.createdOn || now,
      createdBy: rule.createdBy || user?.email || user?.name || "Admin",
      modifiedOn: now,
      modifiedBy: user?.email || user?.name || "Admin",
      isActive: rule.isActive !== false,
    };

    try {
      setTargetingRuleSavingId(rule.id);
      setTargetingRuleError("");
      const response = await fetch(rule.serverId ? `https://localhost:7150/api/TargetingRules/${rule.serverId}` : "https://localhost:7150/api/TargetingRules", {
        method: rule.serverId ? "PUT" : "POST",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Unable to save targeting rule");
      setTargetingRules((rules) => rules.map((item) =>
        item.id === rule.id ? { ...item, saved: true } : item
      ));
    } catch {
      setTargetingRuleError("Unable to save the targeting rule. Please check the API and try again.");
    } finally {
      setTargetingRuleSavingId(null);
    }
  };

  const toUtcIsoString = (value) => value ? new Date(value).toISOString() : null;

  const loadCreatives = async () => {
    try {
      setCreativesLoading(true);
      setCreativeError("");
      const response = await fetch("https://localhost:7150/api/Creative", { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load creatives");
      const data = await response.json();
      setCreatives(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setCreativeError("Unable to load creatives. Please check the API and try again.");
    } finally {
      setCreativesLoading(false);
    }
  };

  const getImageDimensions = (dataUrl) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(`${image.naturalWidth}x${image.naturalHeight}`);
    image.onerror = () => resolve("");
    image.src = dataUrl;
  });

  const submitCreative = async () => {
    if (!creativeFile || !creativeFile.type.startsWith("image/")) {
      setCreativeError("Select an image file before uploading.");
      return;
    }

    try {
      setCreativeSaving(true);
      setCreativeError("");
      setCreativeMessage("");
      const preview = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(creativeFile);
      });
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const response = await fetch("https://localhost:7150/api/Creative", {
        method: "POST",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        body: JSON.stringify({
          creativeID: 0,
          offerID: Number(createdOfferId) || 0,
          title: creativeTitle.trim() || creativeFile.name,
          dimensions: await getImageDimensions(preview),
          size: creativeFile.size,
          preview,
          affiliateTrackingURL: "",
          createdOn: now,
          createdBy: user?.email || user?.name || "Admin",
          modifiedOn: now,
          modifiedBy: user?.email || user?.name || "Admin",
          isActive: true,
        }),
      });
      if (!response.ok) throw new Error("Unable to save creative");
      setCreativeFile(null);
      setCreativeFileName("");
      setCreativeTitle("");
      await loadCreatives();
    } catch {
      setCreativeError("Unable to upload the creative. Please check the API and try again.");
    } finally {
      setCreativeSaving(false);
    }
  };

  const deleteCreative = async (creativeID) => {
    if (!window.confirm("Delete this creative?")) return;

    try {
      setCreativeDeletingId(creativeID);
      setCreativeError("");
      setCreativeMessage("");
      const response = await fetch(`https://localhost:7150/api/Creative/${creativeID}`, {
        method: "DELETE",
        headers: { accept: "*/*" },
      });
      if (!response.ok) throw new Error("Unable to delete creative");
      await loadCreatives();
    } catch {
      setCreativeError("Unable to delete the creative. Please check the API and try again.");
    } finally {
      setCreativeDeletingId(null);
    }
  };

  const shareCreative = async (creative) => {
    const url = creative.affiliateTrackingURL || creative.preview;
    if (!url) {
      setCreativeError("No URL is available to share for this creative.");
      return;
    }

    try {
      setCreativeError("");
      if (navigator.share) await navigator.share({ title: creative.title || "Creative", url });
      else await navigator.clipboard.writeText(url);
      setCreativeMessage(navigator.share ? "Share dialog opened." : "Tracking URL copied to clipboard.");
    } catch (error) {
      if (error.name !== "AbortError") setCreativeError("Unable to share this creative.");
    }
  };

  const creativePreviewSource = (preview) => {
    if (!preview) return "";
    if (preview.startsWith("data:") || preview.startsWith("http://") || preview.startsWith("https://") || preview.startsWith("/")) return preview;
    return `data:image/jpeg;base64,${preview}`;
  };

  const openCreativePreview = (creative) => {
    const source = creativePreviewSource(creative.preview);
    if (!source) {
      setCreativeError("No preview image is available for this creative.");
      return;
    }

    const previewWindow = window.open("", "_blank");
    if (!previewWindow) {
      setCreativeError("The browser blocked the preview window. Please allow pop-ups and try again.");
      return;
    }

    previewWindow.document.title = creative.title || "Creative Preview";
    previewWindow.document.body.style.margin = "0";
    previewWindow.document.body.style.minHeight = "100vh";
    previewWindow.document.body.style.display = "grid";
    previewWindow.document.body.style.placeItems = "center";
    previewWindow.document.body.style.background = "#111";
    const image = previewWindow.document.createElement("img");
    image.src = source;
    image.alt = creative.title || "Creative preview";
    image.style.maxWidth = "100vw";
    image.style.maxHeight = "100vh";
    image.style.objectFit = "contain";
    previewWindow.document.body.append(image);
  };

  const loadLandingPages = async () => {
    try {
      setLandingPagesLoading(true);
      const response = await fetch("https://localhost:7150/api/LandingPages", { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load landing pages");
      const data = await response.json();
      setLandingPages(Array.isArray(data) ? data : data.items || data.data || []);
    } finally {
      setLandingPagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeStep === 2 || activeStep === 3) loadLandingPages();
  }, [activeStep]);

  useEffect(() => {
    if (activeStep === 4) loadCreatives();
  }, [activeStep]);

  useEffect(() => {
    if (activeStep !== 3) return undefined;
    const controller = new AbortController();

    const loadCountries = async () => {
      try {
        setCountriesLoading(true);
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2", { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load countries");
        const countries = await response.json();
        const names = countries
          .map((country) => country.name?.common)
          .filter(Boolean)
          .sort((first, second) => first.localeCompare(second));
        if (names.length) setCountryOptions([...new Set(names)]);
      } catch (error) {
        // Keep the built-in country options available if the public API is unavailable.
        if (error.name !== "AbortError") setCountryOptions(targetingOptions.Country);
      } finally {
        if (!controller.signal.aborted) setCountriesLoading(false);
      }
    };

    loadCountries();
    return () => controller.abort();
  }, [activeStep]);

  const updateLandingPageForm = (field, value) => {
    setLandingPageForm((current) => ({ ...current, [field]: value }));
  };

  const updateSubLandingUrl = (index, field, value) => {
    setLandingPageForm((current) => ({
      ...current,
      subUrls: current.subUrls.map((subUrl, subIndex) => subIndex === index ? { ...subUrl, [field]: value } : subUrl),
    }));
  };

  const submitLandingPage = async () => {
    if (!landingPageForm.name.trim() || !landingPageForm.url.trim()) return;
    try {
      setLandingPageSaving(true);
      const now = new Date().toISOString();
      const subUrl = landingPageForm.subUrls[0] || {};
      const payload = { id: editingLandingPageId || 0, offerId: 0, name: landingPageForm.name, type: landingPageForm.type, url: landingPageForm.url, targeting: landingPageForm.targeting, affiliateMode: landingPageForm.affiliateMode, affiliateId: Number(landingPageForm.affiliate) || 0, weight: Number(landingPageForm.weight) || 0, visibility: landingPageForm.visibility, description: landingPageForm.description, fallback: landingPageForm.fallback, fallbackName: subUrl.name || "", fallbackUrl: subUrl.url || "", fallbackWeight: Number(subUrl.weight) || 0, enabled: landingPageForm.enabled, createdOn: now, createdBy: "Admin", modifiedOn: now, modifiedBy: "Admin", isActive: true };
      const response = await fetch(editingLandingPageId ? `https://localhost:7150/api/LandingPages/${editingLandingPageId}` : "https://localhost:7150/api/LandingPages", { method: editingLandingPageId ? "PUT" : "POST", headers: { accept: "*/*", "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Unable to save landing page");
      setShowLandingPageModal(false); setEditingLandingPageId(null); await loadLandingPages();
    } finally { setLandingPageSaving(false); }
  };

  const editLandingPage = async (id) => {
    const response = await fetch(`https://localhost:7150/api/LandingPages/${id}`, { headers: { accept: "*/*" } });
    if (!response.ok) return;
    const page = await response.json();
    setLandingPageForm({ name: page.name || "", type: page.type || "Landing", targeting: page.targeting || "", url: page.url || "", affiliateMode: page.affiliateMode || "Allow", affiliate: String(page.affiliateId || ""), weight: String(page.weight ?? "10"), visibility: page.visibility || "Show", description: page.description || "", fallback: page.fallback, subUrls: [{ name: page.fallbackName || "", url: page.fallbackUrl || "", weight: String(page.fallbackWeight || "") }], enabled: page.enabled });
    setEditingLandingPageId(id); setLandingPageActionId(null); setShowLandingPageModal(true);
  };

  const updateLandingPageEnabled = async (page) => {
    const now = new Date().toISOString();
    await fetch(`https://localhost:7150/api/LandingPages/${page.id}`, { method: "PUT", headers: { accept: "*/*", "Content-Type": "application/json" }, body: JSON.stringify({ ...page, enabled: !page.enabled, modifiedOn: now, modifiedBy: "Admin" }) });
    setLandingPageActionId(null); loadLandingPages();
  };

  const deleteLandingPage = async (id) => {
    if (!window.confirm("Delete this landing page?")) return;
    await fetch(`https://localhost:7150/api/LandingPages/${id}`, { method: "DELETE", headers: { accept: "*/*" } });
    setLandingPageActionId(null); loadLandingPages();
  };

  const handleAddAdvertiser = () => {
    if (newAdvertiser.trim()) {
      setAdvertisers([...advertisers, { id: Date.now(), firstName: newAdvertiser, lastName: "" }]);
      setNewAdvertiser("");
      setShowAdvertiserModal(false);
    }
  };

  const loadCategoriesForModal = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError("");
      const response = await fetch("https://localhost:7150/api/OfferCategories", { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load offer categories");
      const data = await response.json();
      setCategories((Array.isArray(data) ? data : data.items || data.data || []).filter((category) => category.isActive !== false));
    } catch {
      setCategoriesError("Unable to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const openCategoryModal = () => {
    setNewCategoryRows([""]);
    setEditedCategoryIds([]);
    setCategoryActionError("");
    setShowCategoryModal(true);
    loadCategoriesForModal();
  };

  const updateNewCategoryRow = (index, value) => {
    setNewCategoryRows((rows) => rows.map((row, rowIndex) => rowIndex === index ? value : row));
  };

  const updateExistingCategory = (id, offerCategoryName) => {
    setCategories((items) => items.map((category) => category.id === id ? { ...category, offerCategoryName } : category));
    setEditedCategoryIds((ids) => ids.includes(id) ? ids : [...ids, id]);
  };

  const saveNewCategories = async () => {
    const names = [...new Set(newCategoryRows.map((name) => name.trim()).filter(Boolean))];
    const changedCategories = categories.filter((category) => editedCategoryIds.includes(category.id));
    if (!names.length && !changedCategories.length) {
      setCategoryActionError("Enter a new category name or edit an existing category before saving.");
      return;
    }
    if (changedCategories.some((category) => !category.offerCategoryName.trim())) {
      setCategoryActionError("Category names cannot be empty.");
      return;
    }

    try {
      setCategorySaving(true);
      setCategoryActionError("");
      const now = new Date().toISOString();
      const createRequests = names.map(async (offerCategoryName) => {
        const response = await fetch("https://localhost:7150/api/OfferCategories", {
          method: "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify({ id: 0, offerCategoryName, createdOn: now, createdBy: "string", modifiedOn: now, modifiedBy: "string", isActive: true }),
        });
        if (!response.ok) throw new Error("Unable to save categories");
      });
      const updateRequests = changedCategories.map(async (category) => {
        const response = await fetch(`https://localhost:7150/api/OfferCategories/${category.id}`, {
          method: "PUT",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify({
            id: category.id,
            offerCategoryName: category.offerCategoryName.trim(),
            createdOn: category.createdOn || now,
            createdBy: category.createdBy || "string",
            modifiedOn: now,
            modifiedBy: "string",
            isActive: category.isActive !== false,
          }),
        });
        if (!response.ok) throw new Error("Unable to update category");
      });
      await Promise.all([...createRequests, ...updateRequests]);
      setNewCategoryRows([""]);
      setEditedCategoryIds([]);
      await loadCategoriesForModal();
    } catch {
      setCategoryActionError("Unable to save categories. Please try again.");
    } finally {
      setCategorySaving(false);
    }
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`Delete the "${category.offerCategoryName}" category?`)) return;

    try {
      setCategoryActionError("");
      const response = await fetch(`https://localhost:7150/api/OfferCategories/${category.id}`, {
        method: "DELETE",
        headers: { accept: "*/*" },
      });
      if (!response.ok) throw new Error("Unable to delete category");
      setCategories((items) => items.filter((item) => item.id !== category.id));
      if (formData.offerCategory === category.offerCategoryName) {
        setFormData((previous) => ({ ...previous, offerCategory: "" }));
      }
    } catch {
      setCategoryActionError("Unable to delete category. Please try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Offer Data:", formData);
    alert("Offer Created Successfully ✅");
    navigate("/offers");
  };

  const nextStep = async () => {
    if (activeStep === 1) {
      // Validate required fields for step 1
      if (!formData.offerName) {
        alert("Please enter Offer Name");
        return;
      }
      if (!formData.advertiser) {
        alert("Please select Advertiser");
        return;
      }
      if (!formData.offerUrl) {
        alert("Please enter Offer URL");
        return;
      }

      try {
        setOfferSaving(true);
        setOfferSaveError("");
        const now = new Date().toISOString();
        const user = JSON.parse(localStorage.getItem("user"));
        const selectedCategory = categories.find((category) => category.offerCategoryName === formData.offerCategory);
        const response = await fetch("https://localhost:7150/api/Offers", {
          method: "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify({
            id: 0,
            ...formData,
            uploadLogo: formData.uploadLogo?.name || "",
            advertiserId: Number(formData.advertiser),
            offerCategoryId: selectedCategory?.id || 0,
            advertiserPrice: Number(formData.advertiserPrice) || 0,
            affiliatePrice: Number(formData.affiliatePrice) || 0,
            startDate: toUtcIsoString(formData.startDate),
            endDate: toUtcIsoString(formData.endDate),
            createdOn: now,
            createdBy: user?.email || user?.name || "Admin",
            modifiedOn: now,
            modifiedBy: user?.email || user?.name || "Admin",
            isActive: true,
          }),
        });

        if (!response.ok) throw new Error("Unable to save offer");
        const savedOffer = await response.json().catch(() => null);
        setCreatedOfferId(savedOffer?.id || savedOffer?.data?.id || 0);
      } catch {
        setOfferSaveError("Unable to save the offer. Please check the API and try again.");
        return;
      } finally {
        setOfferSaving(false);
      }
    }
    if (activeStep < 5) {
      setActiveStep(activeStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />

      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="create-offer-container">
          {/* Header */}
          <div className="offer-header">
            <h1 className="offer-title">Create Offer</h1>
          </div>

          <div className="step-navigation compact-steps">
            {[
              "▣  GENERAL - STEP 1",
              "▣  LANDING - STEP 2",
              "◉  TARGETING - STEP 3",
              "▣  CREATIVES - STEP 4",
              "♧  AFFILIATES - STEP 5",
            ].map((step, index) => (
              <button key={step} type="button" className={`compact-step ${activeStep === index + 1 ? "active" : ""}`} onClick={() => setActiveStep(index + 1)}>
                {step}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: General */}
            {activeStep === 1 && (
              <div className="offer-form">
                <div className="form-section general-info-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Offer Type</label>
                      <select 
                        name="offerType" 
                        value={formData.offerType} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option>General</option>
                        <option>Mobile</option>
                        <option>Incentive</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Offer Name *</label>
                      <input
                        type="text"
                        name="offerName"
                        value={formData.offerName}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter offer name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Upload Logo</label>
                      <input
                        type="file"
                        name="uploadLogo"
                        onChange={handleFileChange}
                        className="form-control"
                        accept="image/*"
                      />
                    </div>
                    <div className="form-group">
                      <label>Advertiser *</label>
                      <div className="select-with-button advertiser-picker">
                        <button
                          type="button"
                          className="advertiser-picker-trigger"
                          aria-haspopup="listbox"
                          aria-expanded={advertiserDropdownOpen}
                          onClick={() => setAdvertiserDropdownOpen((isOpen) => !isOpen)}
                        >
                          <span>{selectedAdvertiser ? `${selectedAdvertiser.id} ~ ${advertiserName(selectedAdvertiser)}` : "Select Advertiser"}</span>
                          <span aria-hidden="true">▾</span>
                        </button>
                        {advertiserDropdownOpen && (
                          <div className="advertiser-picker-menu" role="listbox" aria-label="Advertisers">
                            <input
                              type="search"
                              autoFocus
                              value={advertiserSearch}
                              onChange={(event) => setAdvertiserSearch(event.target.value)}
                              placeholder="Search advertiser"
                              aria-label="Search advertisers"
                            />
                            <div className="advertiser-picker-options">
                              {advertisersLoading && <p>Loading advertisers…</p>}
                              {!advertisersLoading && advertisersError && <p>{advertisersError}</p>}
                              {!advertisersLoading && !advertisersError && filteredAdvertisers.length === 0 && <p>No advertisers found</p>}
                              {filteredAdvertisers.map((advertiser) => (
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={String(advertiser.id) === String(formData.advertiser)}
                                  className="advertiser-picker-option"
                                  key={advertiser.id}
                                  onClick={() => selectAdvertiser(advertiser)}
                                >
                                  <span className="advertiser-avatar">{advertiserInitials(advertiser)}</span>
                                  <span><strong>{advertiser.id} ~ {advertiserName(advertiser)}</strong><small>{advertiser.status || advertiser.companyName || "Advertiser"}</small></span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Offer Category</label>
                      <div className="select-with-button">
                        <select 
                          name="offerCategory" 
                          value={formData.offerCategory} 
                          onChange={handleChange}
                          className="form-control"
                        >
                          <option value="">Select Category</option>
                          {categoriesLoading && <option disabled>Loading categories…</option>}
                          {!categoriesLoading && categoriesError && <option disabled>{categoriesError}</option>}
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.offerCategoryName}>{cat.id} ~ {cat.offerCategoryName}</option>
                          ))}
                        </select>
                        <button 
                          type="button" 
                          className="btn secondary small"
                          onClick={openCategoryModal}
                        >
                          + Create
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>AppID</label>
                      <input
                        type="text"
                        name="appId"
                        value={formData.appId}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter App ID"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>External Offer ID</label>
                      <input
                        type="text"
                        name="externalOfferId"
                        value={formData.externalOfferId}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter External Offer ID"
                      />
                    </div>
                    <div className="form-group">
                      <label>Offer Preview URL</label>
                      <input
                        type="text"
                        name="offerPreviewUrl"
                        value={formData.offerPreviewUrl}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter preview URL"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Offer URL *</label>
                      <textarea
                        name="offerUrl"
                        value={formData.offerUrl}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter offer URL"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Advertiser URL Builder</label>
                      <input
                        type="text"
                        name="advertiserUrlBuilder"
                        value={formData.advertiserUrlBuilder}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter URL builder"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Landing Page</label>
                      <input
                        type="text"
                        name="landingPage"
                        value={formData.landingPage}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter landing page"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tokens</label>
                      <input
                        type="text"
                        name="tokens"
                        value={formData.tokens}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter tokens"
                      />
                    </div>
                  </div>
                </div>

                {/* Advertiser Pricing */}
                <div className="form-section compact-pricing-section">
                  <h3 className="section-title">Advertiser Pricing (Revenue) *</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Select Model</label>
                      <select 
                        name="advertiserModel" 
                        value={formData.advertiserModel} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select Model</option>
                        <option value="cpc">CPC</option>
                        <option value="cpv">CPV</option>
                        <option value="cpl">CPL</option>
                        <option value="cpd">CPD</option>
                        <option value="cpa">CPA</option>
                        <option value="cpi">CPI</option>
                        <option value="cps">CPS</option>
                        <option value="cpm">CPM</option>
                        <option value="cpe">CPE</option>
                        <option value="cpcv">CPCV</option>
                        <option value="cpa+cps">CPA+CPS</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        name="advertiserPrice"
                        value={formData.advertiserPrice}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Select Currency</label>
                      <select 
                        name="advertiserCurrency" 
                        value={formData.advertiserCurrency} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select Currency</option>
                        {currenciesLoading && <option disabled>Loading currencies…</option>}
                        {!currenciesLoading && currenciesError && <option disabled>{currenciesError}</option>}
                        {currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code} ({currency.name})</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Affiliate Pricing */}
                <div className="form-section compact-pricing-section">
                  <h3 className="section-title">Affiliate Pricing (Payout) *</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Select Model</label>
                      <select 
                        name="affiliateModel" 
                        value={formData.affiliateModel} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option value="">Select Model</option>
                         <option value="cpc">CPC</option>
                        <option value="cpv">CPV</option>
                        <option value="cpl">CPL</option>
                        <option value="cpd">CPD</option>
                        <option value="cpa">CPA</option>
                        <option value="cpi">CPI</option>
                        <option value="cps">CPS</option>
                        <option value="cpm">CPM</option>
                        <option value="cpe">CPE</option>
                        <option value="cpcv">CPCV</option>
                        <option value="cpa+cps">CPA+CPS</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        name="affiliatePrice"
                        value={formData.affiliatePrice}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Hide Payout</label>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="hidePayout"
                          checked={formData.hidePayout}
                          onChange={handleChange}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="form-section">
                  <h3 className="section-title">Schedule</h3>
                  <div className="form-row compact-schedule-row">
                    <div className="form-group">
                      <label>Start Date & Time</label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date & Time</label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Daily Start/Stop</label>
                      <label className="switch">
                        <input type="checkbox" name="dailyScheduleEnabled" checked={formData.dailyScheduleEnabled} onChange={handleChange} />
                        <span className="slider round"></span>
                      </label>
                      <div className="time-group" style={{marginTop:"-39px", marginLeft:"57px"}}>
                        <input
                          type="time"
                          name="dailyStartTime"
                          value={formData.dailyStartTime}
                          onChange={handleChange}
                          step="1"
                          className="form-control"
                        />
                        <span className="time-separator">to</span>
                        <input
                          type="time"
                          name="dailyEndTime"
                          value={formData.dailyEndTime}
                          onChange={handleChange}
                          step="1"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offer Settings */}
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Offer Visibility</label>
                      <select 
                        name="offerVisibility" 
                        value={formData.offerVisibility} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option>Public</option>
                        <option>Public + Require Approvel </option>
                        <option>Private</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select 
                        name="status" 
                        value={formData.status} 
                        onChange={handleChange}
                        className="form-control"
                      >
                        <option>Approve</option>
                        <option>Pending</option>
                        <option>Ended</option>
                      </select>
                    </div>
                    <div className="form-group setting-toggle">
                      <label className="switch">
                        <input type="checkbox" name="alertToAffiliates" checked={formData.alertToAffiliates} onChange={handleChange} />
                        <span className="slider round"></span>
                      </label>
                      <label style={{marginTop:"-30px", marginLeft:"52px"}}>Alert to Affiliates</label>
                    </div>
                     <div className="form-group deep-links-toggle">
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="deepLinks"
                          checked={formData.deepLinks}
                        onChange={handleChange}
                        />
                        <span className="slider round"></span>
                      </label>
                      <label style={{marginTop:"-30px", marginLeft:"52px"}}>Enable</label>
                    </div>
                  </div>
                </div>

                {/* Description and Terms */}
                <div className="form-section">
                  <div className="form-group">
                    <label>Terms</label>
                    <RichTextOfferEditor formData={formData} setFormData={setFormData} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Landing pages */}
            {activeStep === 2 && (
              <div className="offer-form landing-v2-form">
                <section className="landing-v2" aria-label="Landing Page">
                  <div className="landing-v2-toolbar">
                    <h2>Landing Page</h2>
                    <div className="landing-v2-actions">
                      <label className="landing-random-toggle">
                        <span>Affiliate Random URL</span>
                        <span className="switch">
                          <input type="checkbox" checked={affiliateRandomUrl} onChange={(event) => setAffiliateRandomUrl(event.target.checked)} />
                          <span className="slider round" />
                        </span>
                      </label>
                      <button type="button" onClick={() => { setEditingLandingPageId(null); setLandingPageForm({ name: "", type: "Landing", targeting: "", url: "", affiliateMode: "Allow", affiliate: "", weight: "10", visibility: "Show", description: "", fallback: false, subUrls: [{ name: "", url: "", weight: "" }], enabled: true }); setShowLandingPageModal(true); }}>+ Add Landing Page</button>
                      <button type="button">Manage Weight</button>
                      <button type="button">☁ Import Landing Page (.csv)</button>
                    </div>
                  </div>

                  <div className="landing-table-wrap">
                    <table className="landing-v2-table">
                      <thead>
                        <tr>
                          <th>ID</th><th>Name</th><th>Type</th><th>URL</th><th>Targeting</th><th>Affiliate</th><th>Weight</th><th>Updated At</th><th>Status</th><th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {landingPagesLoading && <tr><td colSpan="10">Loading landing pages…</td></tr>}
                        {!landingPagesLoading && landingPages.map((page, index) => (
                          <tr key={page.id || `${page.name}-${index}`}>
                            <td>{page.id ? `#${page.id}` : ""}</td><td>{page.name}</td><td>{page.type}</td><td>{page.url}</td><td>{page.targeting}</td><td>{page.affiliateId || page.affiliate}</td><td>{page.weight}</td><td>{page.modifiedOn || page.updatedAt}</td><td><span className={`landing-status ${page.enabled ? "enabled" : "disabled"}`}>{page.enabled ? "◉ Enabled" : "◉ Disabled"}</span></td><td className="landing-action-cell"><button type="button" className="landing-action-button" onClick={() => setLandingPageActionId((current) => current === page.id ? null : page.id)}>⋮</button>{landingPageActionId === page.id && <div className="landing-action-menu"><button type="button" onClick={() => updateLandingPageEnabled(page)}>{page.enabled ? "⊘ Disable" : "✓ Enable"}</button><button type="button" onClick={() => editLandingPage(page.id)}>✎ Edit</button><button type="button" onClick={() => deleteLandingPage(page.id)}>♜ Delete</button></div>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
                <div className="form-actions landing-v2-footer">
                  <button type="button" className="btn secondary" onClick={prevStep}>Previous</button>
                  <button type="button" className="btn primary" onClick={nextStep}>Submit &amp; Next Set Targeting</button>
                </div>
                </div>
            )}

            {/* Step 3: Targeting */}
            {activeStep === 3 && (
              <div className="offer-form targeting-v2-form">
                <section className="targeting-v2" aria-label="Targeting Rules">
                  <div className="targeting-v2-toolbar">
                    <div className="targeting-v2-heading">
                      <h2>▧&nbsp; Targeting Rules</h2>
                      <button type="button" onClick={() => {
                        if (!selectedTargetingLandingPage) {
                          openTargetingRuleEditor();
                          return;
                        }
                        setTargetingRuleError("");
                        setTargetingRules((rules) => [...rules, createTargetingRule(Date.now())]);
                      }}>+ Add Rule</button>
                      {selectedTargetingLandingPage && <button type="button" className="targeting-back-button" onClick={() => {
                        setSelectedTargetingLandingPage(null);
                        setTargetingRules([]);
                        setTargetingRuleError("");
                      }}>← All Offers</button>}
                    </div>
                    <div className="targeting-v2-actions">
                      <button type="button" onClick={nextStep}>◉ Next Upload Creative</button>
                      <button type="button" className="targeting-old-version">Targeting Old Version →</button>
                    </div>
                  </div>
                  {selectedTargetingLandingPage ? <>
                  {targetingRuleError && <p className="offer-save-error" role="alert">{targetingRuleError}</p>}
                  {targetingRules.map((rule) => (
                    <article className="target-rule-card" key={rule.id}>
                      <div className="target-rule-card-title">＋&nbsp; Create Target Rule</div>
                      <div className="target-rule-card-body">
                        <div className="target-rule-name">
                          <label>Rule Name</label>
                          <input type="text" value={rule.name} onChange={(event) => updateTargetingRule(rule.id, { name: event.target.value })} placeholder="Rule name" aria-label="Rule name" />
                        </div>

                        <div className="target-rule-divider" />

                        <div className="target-rule-actions-row">
                          {[['clicks', 'Action On Clicks'], ['conversions', 'Action On Conversions'], ['impressions', 'Action On Impressions']].map(([key, label]) => (
                            <label key={key}>
                              <span>{label}</span>
                              <select value={rule.actions[key]} onChange={(event) => updateTargetingRule(rule.id, { actions: { ...rule.actions, [key]: event.target.value } })}><option value="none">No Action</option><option value="redirect">Redirect</option><option value="block">Block</option></select>
                            </label>
                          ))}
                        </div>

                        <div className="target-rule-divider" />

                        <div className="target-rule-conditions">
                          {rule.conditions.map((condition, index) => (
                            <div className="target-rule-condition" key={`${condition.type}-${index}`}>
                              <label>{condition.type}</label>
                              <select value={condition.operator} onChange={(event) => updateTargetingCondition(rule.id, index, { operator: event.target.value })}><option value="equal">is equal</option><option value="notEqual">is not equal</option></select>
                              <select className="target-rule-value-select" value={condition.value} onChange={(event) => updateTargetingCondition(rule.id, index, { value: event.target.value })} aria-label={`Select ${condition.type}`} disabled={condition.type === "Country" && countriesLoading}>
                                <option value="">{condition.type === "Country" && countriesLoading ? "Loading countries..." : `Select ${condition.type}`}</option>
                                {(condition.type === "Country" ? countryOptions : targetingOptions[condition.type]).map((option) => <option key={option} value={option}>{option}</option>)}
                              </select>
                            </div>
                          ))}
                          <button style={{width:"80px"}} type="button" className="target-rule-add-more" onClick={() => updateTargetingRule(rule.id, { conditions: [...rule.conditions, { type: "Country", operator: "equal", value: "" }] })}>＋ Add More</button>
                        </div>

                        <div className="target-rule-divider" />

                        <div className="target-rule-footer-row">
                          <label>Affiliate Visibility</label>
                          <select value={rule.affiliateVisibility} onChange={(event) => updateTargetingRule(rule.id, { affiliateVisibility: event.target.value })}><option value="show">Show</option><option value="hide">Hide</option></select>
                          <label className="switch target-rule-switch">
                            <input type="checkbox" checked={rule.enabled} onChange={(event) => updateTargetingRule(rule.id, { enabled: event.target.checked })} />
                            <span className="slider round" />
                          </label>
                          <span>Enable Rule</span>
                        </div>

                        <div className="target-rule-divider target-rule-last-divider" />
                        <div className="target-rule-submit-row">
                          {rule.saved && <span role="status">Rule saved successfully.</span>}
                          <button
                            style={{ width: "80px" }}
                            type="button"
                            onClick={() => submitTargetingRule(rule)}
                            disabled={targetingRuleSavingId === rule.id}
                          >
                            {targetingRuleSavingId === rule.id ? "Saving..." : "◉ Submit"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                  {targetingRules.length === 0 && <p className="targeting-rule-list">Click “+ Add Rule” to create a targeting rule for <strong>{selectedTargetingLandingPage.name}</strong>.</p>}
                  </> : <div className="targeting-offer-list">
                    <h3>Offer</h3>
                    {targetingRuleError && <p className="offer-save-error" role="alert">{targetingRuleError}</p>}
                    {landingPagesLoading && <p className="targeting-rule-list">Loading offers...</p>}
                    {!landingPagesLoading && landingPages.filter((page) => page.isActive !== false).map((page) => (
                      <button
                        className="targeting-offer-card"
                        key={page.id}
                        type="button"
                        onClick={() => openTargetingRuleEditor(page)}
                      >
                        <span className="targeting-offer-handle">☰</span>
                        <span className="targeting-offer-details"><strong>{page.name}</strong><small>#{page.id}</small></span>
                        <span className="targeting-offer-actions">◉ <em>Edit</em></span>
                      </button>
                    ))}
                    {!landingPagesLoading && landingPages.length === 0 && <p className="targeting-rule-list">No offers found.</p>}
                  </div>}
                </section>
                <WizardStepFooter onPrevious={prevStep} onNext={nextStep} />
                </div>
            )}

            {/* Step 4: Creatives */}
            {activeStep === 4 && (
              <div className="offer-form creatives-v2-form">
                <section className="creatives-v2" aria-label="Creatives">
                  <div className="creatives-v2-upload-row">
                    <label htmlFor="creative-upload-type">Upload</label>
                    <select id="creative_type" className="form-control" name="creative_type" value={creativeUploadType} onChange={(event) => { setCreativeUploadType(event.target.value); setCreativeFileName(""); setCreativeFile(null); }}>
                      <option value="">Choose Creatives</option>
                      <option value="html">HTML ( Zip File Only )</option>
                      <option value="html_file">HTML File</option>
                      <option value="image">Image ( PNG , JPEG , GIF , ICO , SVG , WEBP )</option>
                      <option value="video">Video ( MP4 , MPEG , WEBM )</option>
                      <option value="link">Link</option>
                      <option value="logo">Offer Logo (Single File)</option>
                    </select>
                    {creativeUploadType && creativeUploadType !== "link" && (
                      <label className="creative-file-picker">
                        ☁&nbsp; {creativeFileName || (creativeUploadType === "html" ? "Choose Zip File" : "Choose File")}
                        <input
                          type="file"
                          accept={creativeUploadType === "image" ? "image/png,image/jpeg,image/gif,image/x-icon,image/svg+xml,image/webp" : undefined}
                          onChange={(event) => {
                            const file = event.target.files?.[0] || null;
                            setCreativeFile(file);
                            setCreativeFileName(file?.name || "");
                            setCreativeTitle(file?.name || "");
                          }}
                        />
                      </label>
                    )}
                    <button style={{width:"100px"}} className="creative-save-button" type="button" onClick={submitCreative} disabled={creativeSaving}>{creativeSaving ? "Uploading..." : "Upload Creative"}</button>
                    <button style={{width:"128px"}} type="button" onClick={nextStep}>◉ Next Assign Affiliate</button>
                  </div>
                  {creativeError && <p className="offer-save-error" role="alert">{creativeError}</p>}
                  {creativeMessage && <p className="creative-success-message" role="status">{creativeMessage}</p>}
                  <div className="creatives-v2-table-wrap">
                    <table className="creatives-v2-table">
                      <thead>
                        <tr><th>CreativeID</th><th>OfferID</th><th>Title</th><th>Dimensions</th><th>Size</th><th>Preview</th><th>Action</th><th>Affiliate Tracking URL</th></tr>
                      </thead>
                      <tbody>
                        {creativesLoading && <tr><td colSpan="8" className="creatives-empty">Loading creatives...</td></tr>}
                        {!creativesLoading && creatives.filter((creative) => creative.isActive !== false).map((creative) => (
                          <tr key={creative.creativeID}>
                            <td>{creative.creativeID}</td>
                            <td>{creative.offerID}</td>
                            <td>{creative.title}</td>
                            <td>{creative.dimensions}</td>
                            <td>{creative.size ? `${(creative.size / (1024 * 1024)).toFixed(2)} MB` : "0 MB"}</td>
                            <td>{creative.preview ? <img className="creative-preview-image" src={creativePreviewSource(creative.preview)} alt={creative.title || "Creative preview"} /> : "-"}</td>
                            <td className="creative-action-cell">
                              <button style={{width:"50px"}} type="button" className="creative-preview-button" onClick={() => openCreativePreview(creative)}>Preview</button>
                              <button style={{width:"43px"}} type="button" className="creative-delete-button" onClick={() => deleteCreative(creative.creativeID)} disabled={creativeDeletingId === creative.creativeID}>{creativeDeletingId === creative.creativeID ? "..." : "Delete"}</button>
                            </td>
                            <td><button style={{width:"98px"}} type="button" className="creative-share-button" onClick={() => shareCreative(creative)}>Share</button></td>
                          </tr>
                        ))}
                        {!creativesLoading && creatives.length === 0 && <tr><td colSpan="8" className="creatives-empty">No creatives uploaded.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
                <WizardStepFooter onPrevious={prevStep} onNext={nextStep} />
                </div>
            )}

            {/* Step 5: Affiliates */}
            {activeStep === 5 && (
              <div className="offer-form affiliates-v2-form">
                <section className="affiliates-v2" aria-label="Manage Affiliates">
                  <div className="affiliates-v2-main">
                    <div className="affiliates-v2-toolbar">
                      <div className="affiliates-v2-title">♧&nbsp; Manage Affiliates <button type="button" aria-label="Refresh affiliates">⟳</button></div>
                      <label className="affiliates-v2-search">Search:<input value={affiliateSearch} onChange={(event) => setAffiliateSearch(event.target.value)} /></label>
                    </div>
                    <div className="affiliates-v2-columns"><span>◉&nbsp; OfferID</span><span>♙&nbsp; Affiliate</span><span>⚙&nbsp; Action</span></div>
                    <h2 className="affiliates-v2-unassigned">?&nbsp;&nbsp; Not Assigned</h2>
                    <div className="affiliates-v2-rows">
                      {offerAffiliates.filter((item) => item.affiliate.toLowerCase().includes(affiliateSearch.toLowerCase()) || item.offer.toLowerCase().includes(affiliateSearch.toLowerCase())).map((item) => (
                        <div className="affiliate-v2-row" key={item.id}>
                          <span>{item.offer}</span>
                          <span className="affiliate-v2-name"><i style={{ background: item.color }}>{item.initials}</i>{item.affiliate}</span>
                          <span className="affiliate-v2-actions"><button type="button" onClick={() => setOfferAffiliates((items) => items.filter((affiliate) => affiliate.id !== item.id))}>＋ Assign Offer</button><button type="button">⊗ Reject</button></span>
                        </div>
                      ))}
                    </div>
                    <div className="affiliates-v2-bottom">
                      <label><input type="checkbox" /> Send Alert to Affiliate</label>
                      <label><input type="checkbox" /> Send Alert to Admin</label>
                      <button type="button" onClick={() => setOfferAffiliates([])}>＋ Assign All</button>
                    </div>
                    <div className="affiliates-v2-finish"><button type="button" onClick={handleSubmit}>✓ Finish Offer Create</button></div>
                  </div>

                  <aside className="affiliates-v2-summary">
                    <button type="button" className="affiliates-v2-share" onClick={() => setShowTrackingUrlModal(true)}>♧ <strong>Affiliate Tracking URL</strong><small>Share Affiliate Tracking URL</small></button>
                    {[['▤', '3', 'ALL AFFILIATES', '#00a9f4'], ['◷', '0', 'PENDING', '#f4b900'], ['☑', '0', 'APPROVED', '#20b855'], ['⊗', '0', 'REJECTED', '#ff4a42']].map(([icon, count, label, color]) => (
                      <div className="affiliates-v2-stat" key={label}><i style={{ color }}>{icon}</i><div><b>{count}</b><span>↗&nbsp; {label}</span></div></div>
                    ))}
                  </aside>
                </section>
              </div>
            )}

            {/* Submit button for Step 1 */}
            {activeStep === 1 && (
              <div className="form-actions">
                <button type="button" className="btn secondary" onClick={() => navigate("/offers")}>Cancel</button>
                <button type="button" className="btn primary" onClick={nextStep} disabled={offerSaving}>{offerSaving ? "Saving..." : "Submit & Next Set Targeting"}</button>
                {offerSaveError && <span className="offer-save-error">{offerSaveError}</span>}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Advertiser Modal */}
      {showAdvertiserModal && (
        <div className="modal-overlay" onClick={() => setShowAdvertiserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Advertiser</h3>
            <input
              type="text"
              className="form-control"
              placeholder="Enter advertiser name"
              value={newAdvertiser}
              onChange={(e) => setNewAdvertiser(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowAdvertiserModal(false)}>Cancel</button>
              <button className="btn primary" onClick={handleAddAdvertiser}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content category-manager-modal" onClick={(e) => e.stopPropagation()}>
            <div className="category-manager-header">
              <h3>☰ <span>Offer Categories</span></h3>
              <button style={{marginLeft:"659px",marginTop:"-40px"}} type="button" onClick={() => setShowCategoryModal(false)} aria-label="Close categories">×</button>
            </div>
            <div className="category-manager-table" role="region" aria-label="Offer categories">
              <div className="category-manager-table-head"><span>Category</span><span>Action</span></div>
              {categoriesLoading && <p className="category-manager-message">Loading categories…</p>}
              {!categoriesLoading && categories.map((category) => (
                <div className="category-manager-row" key={category.id}>
                  <input value={category.offerCategoryName} onChange={(event) => updateExistingCategory(category.id, event.target.value)} aria-label={`Category ${category.offerCategoryName}`} />
                  <button type="button" className="category-delete-button" onClick={() => deleteCategory(category)} aria-label={`Delete ${category.offerCategoryName}`}>▣</button>
                </div>
              ))}
              {!categoriesLoading && !categories.length && <p className="category-manager-message">No categories found.</p>}
              {newCategoryRows.map((name, index) => (
                <div className="category-manager-row category-manager-new-row" key={`new-${index}`}>
                  <button type="button" className="category-add-button" onClick={() => index === newCategoryRows.length - 1 && setNewCategoryRows((rows) => [...rows, ""])} aria-label="Add category row">+</button>
                  <input value={name} onChange={(event) => updateNewCategoryRow(index, event.target.value)} placeholder="Enter category name" aria-label={`New category ${index + 1}`} />
                </div>
              ))}
            </div>
            {(categoriesError || categoryActionError) && <p className="category-manager-error">{categoryActionError || categoriesError}</p>}
            <div className="category-manager-actions">
              <button type="button" style={{width:"77px"}} className="category-submit-button" disabled={categorySaving} onClick={saveNewCategories}>{categorySaving ? "Saving…" : "◉ Submit"}</button>
            </div>
          </div>
        </div>
      )}

      {showLandingPageModal && (
        <div className="modal-overlay" onClick={() => setShowLandingPageModal(false)}>
          <section className="landing-page-modal" onClick={(event) => event.stopPropagation()} aria-label="Add landing page">
            <header className="landing-page-modal-header"><h2>{editingLandingPageId ? "Edit Landing Page" : "Landing Page"}</h2><button style={{marginTop:"-30px", marginLeft:"550px"}} type="button" onClick={() => setShowLandingPageModal(false)} aria-label="Close">×</button></header>
            <div className="landing-page-fields">
              <label>Name<input value={landingPageForm.name} onChange={(event) => updateLandingPageForm("name", event.target.value)} placeholder="Landing Page Name" /></label>
              </div>
              <div className="landing-page-fields">
              <label>Type<select value={landingPageForm.type} onChange={(event) => updateLandingPageForm("type", event.target.value)}><option>Landing</option><option>Redirect</option></select></label>
                </div>
              <div className="landing-page-fields">
              <label>Select Targeting<select value={landingPageForm.targeting} onChange={(event) => updateLandingPageForm("targeting", event.target.value)}><option value="">Select Rule</option><option>All Traffic</option></select></label>
                </div>
              <div className="landing-page-fields">
              <label>URL<input value={landingPageForm.url} onChange={(event) => updateLandingPageForm("url", event.target.value)} placeholder="URL" /></label>
               </div>
              <div className="landing-page-fields">
              <label>AffiliateID<select value={landingPageForm.affiliateMode} onChange={(event) => updateLandingPageForm("affiliateMode", event.target.value)}><option>Allow</option><option>Block</option></select></label>
               </div>
              <div className="landing-page-fields">
              <label>Select Affiliate<select value={landingPageForm.affiliate} onChange={(event) => updateLandingPageForm("affiliate", event.target.value)} disabled={affiliatesLoading}>
                <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
              </select></label>
               </div>
              <div className="landing-page-fields">
              <label>Weight<input value={landingPageForm.weight} onChange={(event) => updateLandingPageForm("weight", event.target.value)} placeholder="10" /></label>
               </div>
              <div className="landing-page-fields">
              <label>Affiliate Visibility<select value={landingPageForm.visibility} onChange={(event) => updateLandingPageForm("visibility", event.target.value)}><option>Show</option><option>Hide</option></select></label>
              </div>
              <div className="landing-page-fields">
              <label className="landing-description-label">Description<textarea value={landingPageForm.description} onChange={(event) => updateLandingPageForm("description", event.target.value)} placeholder="Landing Page Description" /></label>
            </div>
            <div className="landing-fallback"><span>Fallback</span><label className="switch"><input type="checkbox" checked={landingPageForm.fallback} onChange={(event) => updateLandingPageForm("fallback", event.target.checked)} /><span className="slider round" /></label><b>Enable</b></div>
            {landingPageForm.fallback && <fieldset className="sub-landing-urls"><legend>Sub Landing URLs</legend>{landingPageForm.subUrls.map((subUrl, index) => <div className="sub-landing-row" key={index}><input value={subUrl.name} onChange={(event) => updateSubLandingUrl(index, "name", event.target.value)} placeholder="Name" /><input value={subUrl.url} onChange={(event) => updateSubLandingUrl(index, "url", event.target.value)} placeholder="URL" /><input value={subUrl.weight} onChange={(event) => updateSubLandingUrl(index, "weight", event.target.value)} placeholder="Weight" /><button type="button" onClick={() => setLandingPageForm((current) => ({ ...current, subUrls: current.subUrls.filter((_, subIndex) => subIndex !== index) }))}>×</button></div>)}<button type="button" className="add-more-sub-url" onClick={() => setLandingPageForm((current) => ({ ...current, subUrls: [...current.subUrls, { name: "", url: "", weight: "" }] }))}>＋ Add more</button></fieldset>}
            <footer className="landing-page-modal-footer"><label className="switch"><input type="checkbox" checked={landingPageForm.enabled} onChange={(event) => updateLandingPageForm("enabled", event.target.checked)} /><span className="slider round" /></label><span>Enable</span><button style={{width:"10%"}} type="button" disabled={landingPageSaving} onClick={submitLandingPage}>{landingPageSaving ? "Saving…" : "◉ Submit"}</button></footer>
          </section>
        </div>
      )}

      {showTrackingUrlModal && (
        <div className="modal-overlay" onClick={() => setShowTrackingUrlModal(false)}>
          <section className="tracking-url-modal" onClick={(event) => event.stopPropagation()} aria-label="Affiliate tracking URL">
            <header className="tracking-url-header"><h2><span aria-hidden="true">▣</span> Affiliates Tracking URL</h2><button type="button" className="tracking-integration">⚙ Integration</button><button type="button" className="tracking-close" onClick={() => setShowTrackingUrlModal(false)} aria-label="Close">×</button></header>
            <div className="tracking-url-fields">
              <label>Select Offer<select value={trackingOffer} onChange={(event) => setTrackingOffer(event.target.value)} disabled={offersLoading}><option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>{offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}</select></label>
              <label>Select Affiliate<select value={trackingAffiliate} onChange={(event) => setTrackingAffiliate(event.target.value)} disabled={affiliatesLoading}><option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>{affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}</select></label>
              <label>Tracking URL<textarea readOnly value={trackingAffiliate && selectedTrackingOffer ? `https://tracking.example.com/click?offer=${selectedTrackingOffer.id}&affiliate=${trackingAffiliate}` : ""} /></label>
              <button type="button" style={{width:"61px"}} className="tracking-email">✉ Email</button>
            </div>
            <div className="tracking-option-grid">
              {[['impression', '♙ Impression URL'], ['description', '▣ Description'], ['qrCode', '▦ QR Code'], ['additionalTokens', '♧ Additional Tokens'], ['landingPages', '▣ Landing Pages'], ['preLandingPages', '▤ Pre-Landing Pages'], ['defaultTokens', '♧ Affiliate Default Tokens'], ['googleAds', 'G Google Ads'], ['shortUrl', '⊗ Short URL NEW'], ['shortUrlParams', '⊗ Short URL with Params']].map(([key, label]) => <label key={key} className="tracking-toggle"><span className="switch"><input type="checkbox" checked={trackingOptions[key]} onChange={(event) => setTrackingOptions((current) => ({ ...current, [key]: event.target.checked }))} /><span className="slider round" /></span>{label}</label>)}
            </div>
            <div className="tracking-token-grid">
              {["aff_click_id", "aff_sub1", "aff_sub3", "aff_sub5", "aff_sub7", "aff_sub9", "source", "googleaid", "androidid", "DeepLink", "sub_aff_id", "aff_sub2", "aff_sub4", "aff_sub6", "aff_sub8", "aff_sub10", "deviceid", "iosidfa", "creativeid"].map((token, index) => <label key={token}><input type="checkbox" defaultChecked={index === 0} /><span>{token}</span><input defaultValue={token === "DeepLink" ? "http://example.com/" : "{replace_it}"} /></label>)}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
