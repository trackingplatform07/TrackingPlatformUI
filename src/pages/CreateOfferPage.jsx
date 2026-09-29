import React, { useEffect, useRef, useState } from "react";
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
  FaHome,
  FaThLarge,
  FaListAlt,
  FaBullseye,
  FaUsers,
  FaSlidersH,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaShieldAlt,
  FaRobot,
  FaEllipsisH,
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

// The Edit Offer tab bar mirrors the full offer navigation used elsewhere in the
// platform. The first five tabs reuse the exact same step content as CreateOfferPage;
// the rest are placeholders until those sections are built out.
const editOfferTabs = [
  { key: "home", label: "HOME", icon: FaHome, step: null },
  { key: "general", label: "GENERAL", icon: FaThLarge, step: 1 },
  { key: "landing", label: "LANDING", icon: FaListAlt, step: 2 },
  { key: "targeting", label: "TARGETING", icon: FaBullseye, step: 3 },
  { key: "creatives", label: "CREATIVES", icon: FaImage, step: 4 },
  { key: "affiliates", label: "AFFILIATES", icon: FaUsers, step: 5 },
  { key: "capping", label: "CAPPING", icon: FaSlidersH, step: null },
  { key: "events", label: "EVENTS / PAYOUT", icon: FaMoneyBillWave, step: null },
  { key: "fallback", label: "FALLBACK / INTEGRATION", icon: FaExchangeAlt, step: null },
  { key: "antifraud", label: "ANTI FRAUD", icon: FaShieldAlt, step: null },
  { key: "automation", label: "AUTOMATION", icon: FaRobot, step: null },
  { key: "more", label: "MORE", icon: FaEllipsisH, step: null },
];

const editOfferTabPlaceholders = {
  home: "An overview of this offer will be available here soon.",
  capping: "Offer capping settings will be available here soon.",
  events: "Event tracking and payout configuration will be available here soon.",
  fallback: "Fallback URLs and third-party integrations will be available here soon.",
  antifraud: "Anti-fraud rules and monitoring will be available here soon.",
  automation: "Automation rules will be available here soon.",
  more: "Additional offer settings will be available here soon.",
  suppression: "Suppression list management will be available here soon.",
  retargeting: "Retargeting tags will be available here soon.",
  others: "Other offer settings will be available here soon.",
};

// Items shown in the "MORE" tab's dropdown menu.
const moreMenuItems = [
  { key: "suppression", label: "Suppression List", icon: "☰" },
  { key: "retargeting", label: "Retargeting Tags", icon: "</>" },
  { key: "others", label: "Others", icon: "🔗" },
];

// Global retargeting snippet: reads aff_id / offer_id from the current page's URL and,
// if both are present, loads the retargeting pixel script for that click.
const GLOBAL_RETARGETING_SCRIPT = `<script>function p(n){return new URLSearchParams(window.location.search).get(n);}var a=p("aff_id"),o=p("offer_id");if(a&&o){var s=document.createElement("script");s.src="https://web-resources-dyn.offer18a.net/sdk/web/WebRTG.js?t=ao&a="+a+"&o="+o;s.async=true;document.body.appendChild(s);}</script>`;

// Cards shown under MORE > Others — a launcher grid to other tools elsewhere in the app.
// Reference macros shown in the "Add Postback" popup's Postback Tokens section —
// pasted into the Postback URL field wherever that value should be substituted.
const postbackTokensList = [
  { label: "Aff Click ID", token: "{aff_click_id}" },
  { label: "Sub Affiliate ID", token: "{sub_aff_id}" },
  { label: "Aff Sub ID 1", token: "{aff_sub1}" },
  { label: "Aff Sub ID 2", token: "{aff_sub2}" },
  { label: "Aff Sub ID 3", token: "{aff_sub3}" },
  { label: "Aff Sub ID 4", token: "{aff_sub4}" },
  { label: "Aff Sub ID 5", token: "{aff_sub5}" },
  { label: "Aff Sub ID 6", token: "{aff_sub6}" },
  { label: "Aff Sub ID 7", token: "{aff_sub7}" },
  { label: "Aff Sub ID 8", token: "{aff_sub8}" },
  { label: "Aff Sub ID 9", token: "{aff_sub9}" },
  { label: "Aff Sub ID 10", token: "{aff_sub10}" },
  { label: "Event (Offer install, uninstall, subscribe, deactivation)", token: "{event_token}" },
  { label: "Offer Payout", token: "{payout}" },
  { label: "Payout Currency (USD,INR,EUR)", token: "{currency}" },
];

// Useragent presets offered as quick-select links in the Affiliate Postback Test popup.
const AFFILIATE_TEST_USERAGENTS = {
  Desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Android: "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36",
  iOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
};

// Report template tags shown in the Reports view's "Templates" row.
const reportTemplates = [
  { key: "basic", label: "Basic Report", icon: "📊" },
  { key: "offer", label: "Offer" },
  { key: "affiliate", label: "Affiliate" },
  { key: "country", label: "Country" },
  { key: "events", label: "Events" },
  { key: "fraud-fender", label: "Fraud Fender", icon: "🛡", accent: true },
  { key: "igaming-badge", label: "iGaming", icon: "📶" },
];

const LINK_TESTER_OS_OPTIONS = [
  "Android 7", "Android 8", "Android 9", "Android 10", "Android 11", "Android 12", "Android 13",
  "iOS 14", "iOS 15", "iOS 16", "iOS 17",
  "Windows 10", "Windows 11", "macOS", "Linux",
];

const reportTemplatesRow2 = [
  { key: "smart-offer", label: "Smart Offer", icon: "🔀" },
  { key: "igaming", label: "igaming", hasCaret: true },
];

const othersCards = [
  {
    key: "advertiser-postback",
    icon: "👤",
    color: "#e07b39",
    title: "Advertiser Postback",
    category: "Postback",
    buttons: [
      { label: "Get Postback URL", icon: "📋", action: "postback" },
      { label: "View Postback Logs", icon: "📋", action: "postback-logs" },
    ],
  },
  {
    key: "affiliate-postback",
    icon: "👥",
    color: "#3fa66a",
    title: "Affiliate Postback",
    category: "Postback",
    buttons: [
      { label: "Manage", icon: "⚙", action: "affiliate-postback" },
      { label: "View Postback Logs", icon: "📋", action: "affiliate-postback-logs" },
    ],
  },
  {
    key: "affiliate-postback-test",
    icon: "✕",
    color: "#e5534b",
    title: "Affiliate Postback Test",
    category: "Postback",
    buttons: [
      { label: "Start Test", icon: "▶", action: "affiliate-postback-test" },
      { label: "Deep Postback Test", icon: "▶", action: "affiliate-postback-test-deep" },
    ],
  },
  {
    key: "reports",
    icon: "◔",
    color: "#e5534b",
    title: "Reports",
    category: "Reports",
    buttons: [
      { label: "Basic Reports", icon: "📊", action: "reports" },
      { label: "Test Reports", icon: "📋", action: "reports" },
      { label: "Conversions Logs", icon: "📋", action: "conversion-logs" },
      { label: "Cap Reports", icon: "📋", action: "capping-logs" },
    ],
  },
  {
    key: "change-logs",
    icon: "📅",
    color: "#3fa66a",
    title: "Change Logs",
    category: "Logs",
    buttons: [
      { label: "View Change Logs", icon: "▦", action: "change-logs" },
    ],
  },
  {
    key: "link-tester",
    icon: "🧪",
    color: "#e07b39",
    title: "Link Tester",
    category: "Health Check",
    buttons: [
      { label: "Link Test", icon: "▶", action: "link-tester" },
    ],
  },
];

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

export default function CreateOfferPage({ editOfferId = null }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [activePlaceholderTab, setActivePlaceholderTab] = useState(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const [cappingFormOpen, setCappingFormOpen] = useState(false);
  const [cappingRule, setCappingRule] = useState({
    ruleName: "",
    ruleType: "Advertiser Capping",
    cappingType: "Gross Conversions (advertiser)",
    period: "Daily",
    cappingValue: "",
    overCappingAction: "Stop Offer",
    cappingTimezoneEnabled: false,
    events: "",
    affiliateVisibility: "Show",
    enableRule: true,
    notificationEmail: "",
    earlierNotificationThreshold: "",
  });
  const [cappingRules, setCappingRules] = useState([]);
  const [cappingRulesLoading, setCappingRulesLoading] = useState(false);
  const [cappingRuleSaving, setCappingRuleSaving] = useState(false);
  const [cappingRuleError, setCappingRuleError] = useState("");
  const [editingCappingRuleId, setEditingCappingRuleId] = useState(null);
  const [eventSettings, setEventSettings] = useState({
    conversionWaitingTime: "30 Days",
    multiConversion: "Allow Multi Conversions",
    conversionApproval: "Auto",
    multiConversionIp: "Allow from Same IP",
    defaultPostbackEvent: "initial - default",
    eventMismatchAction: "Record Conversion as initial Event",
  });
  const [eventSettingsId, setEventSettingsId] = useState(null);
  const [eventSettingsLoading, setEventSettingsLoading] = useState(false);
  const [eventSettingsSaving, setEventSettingsSaving] = useState(false);
  const [eventSettingsMessage, setEventSettingsMessage] = useState("");
  const [payoutRules, setPayoutRules] = useState([]);
  const [payoutRulesLoading, setPayoutRulesLoading] = useState(false);
  const [payoutRuleSaving, setPayoutRuleSaving] = useState(false);
  const [payoutRuleError, setPayoutRuleError] = useState("");
  const [payoutRuleFormOpen, setPayoutRuleFormOpen] = useState(false);
  const [editingPayoutRuleId, setEditingPayoutRuleId] = useState(null);
  const [payoutRuleForm, setPayoutRuleForm] = useState({
    ruleName: "",
    revenueModel: "",
    revenueValue: "0",
    payoutModel: "",
    payoutValue: "0",
    currency: "",
    conditions: [
      { type: "Affiliate ID", operator: "is equal", value: "" },
      { type: "Event", operator: "is equal", value: "initial" },
      { type: "Country", operator: "is equal", value: "" },
    ],
    affiliateVisibility: "Show",
    rulePriority: "10 High",
    enableRule: true,
  });
  const [openAffiliateConditionIndex, setOpenAffiliateConditionIndex] = useState(null);
  const [payoutAffiliateSearch, setPayoutAffiliateSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [fallbackForm, setFallbackForm] = useState({
    postbackType: "all",
    enableFallback: "Disabled",
    fallbackUrl: "",
    fallbackOffer: "",
    fallbackOfferReportsAffiliates: "Disabled",
    htmlJsCode: "",
    urlToReplace: "",
    erid: "",
    forceAffiliateLandingRedirect: "disable",
  });
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [fallbackId, setFallbackId] = useState(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackSaving, setFallbackSaving] = useState(false);

  const clickBlockFilterKeys = ["ip", "aff_id", "sub_aff_id", "aff_sub1", "aff_sub2", "aff_sub3", "aff_sub4", "aff_sub5", "source", "referral_domain"];
  const conversionValidateFilterKeys = ["adv_sub1", "adv_sub2", "adv_sub3", "adv_sub4", "adv_sub5", "click_aff_sub1", "click_aff_sub2", "click_aff_sub3", "click_aff_sub4", "click_source", "click_google_aid", "click_device_id", "click_android_id", "click_ios_idfa"];

  const [antiFraudForm, setAntiFraudForm] = useState({
    clickSpammingDefender: "",
    uniqueClickLimit: "",
    proxyBotBlock: "Disabled",
    browserBlankReferral: "Allow",
    defaultIpSource: "X Forwarded For ( server side )",
    clickIpv4RangeFilter: "Allow",
    clickIpv4RangeValues: "",
    htmlRedirectHttpReferral: "",
  });
  const [clickBlockFilters, setClickBlockFilters] = useState(
    Object.fromEntries(clickBlockFilterKeys.map((key) => [key, ""]))
  );
  const [conversionValidateFilters, setConversionValidateFilters] = useState(
    Object.fromEntries(conversionValidateFilterKeys.map((key) => [key, { value: "", mode: "" }]))
  );
  const [ctitRules, setCtitRules] = useState([
    { id: 1, from: "Click", to: ["All"], minSeconds: "0", maxSeconds: "2678400", then: "Accept Conversion" },
  ]);
  const [antiFraudMessage, setAntiFraudMessage] = useState("");
  const [antiFraudSaving, setAntiFraudSaving] = useState(false);

  const [automationView, setAutomationView] = useState("list");
  const [automationRules, setAutomationRules] = useState([]);
  const [automationRulesLoading, setAutomationRulesLoading] = useState(false);
  const [automationRuleError, setAutomationRuleError] = useState("");
  const [automationSaving, setAutomationSaving] = useState(false);
  const [editingAutomationRuleId, setEditingAutomationRuleId] = useState(null);
  const [automationForm, setAutomationForm] = useState({
    ruleName: "",
    status: "Active",
    blockLevel: "Offer Level",
    advertiser: "",
    offers: [],
    conversion: "",
    clicks: "",
    impressions: "",
    field: "CR",
    compareType: "< Minimum Value",
    minValue: "0",
    maxValue: "",
    reportStatus: "",
    dataLookBack: "1 Hour",
    schedule: "10 Mint",
    dateStart: new Date().toISOString().slice(0, 10),
    dateEnd: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    whitelistOffers: "",
    resumeAfter: "1 Hour",
    alertEnabled: false,
  });

  const [suppressionView, setSuppressionView] = useState("list");
  const [suppressionLists, setSuppressionLists] = useState([]);
  const [suppressionListsLoading, setSuppressionListsLoading] = useState(false);
  const [suppressionListError, setSuppressionListError] = useState("");
  const [suppressionSaving, setSuppressionSaving] = useState(false);
  const [editingSuppressionId, setEditingSuppressionId] = useState(null);
  const [suppressionForm, setSuppressionForm] = useState({
    name: "",
    offerId: "",
    sourceType: "URL",
    url: "",
    unsubscribeUrl: "",
    subjectLines: "",
    fromLines: "",
  });

  const [retargetingView, setRetargetingView] = useState("list");
  const [retargetingTags, setRetargetingTags] = useState([]);
  const [retargetingTagsLoading, setRetargetingTagsLoading] = useState(false);
  const [retargetingTagError, setRetargetingTagError] = useState("");
  const [retargetingSaving, setRetargetingSaving] = useState(false);
  const [editingRetargetingId, setEditingRetargetingId] = useState(null);
  const [retargetingForm, setRetargetingForm] = useState({
    tagName: "",
    affiliateId: "",
    url: "",
    code: "",
  });
  const [showGlobalRetargetingModal, setShowGlobalRetargetingModal] = useState(false);
  const [globalRetargetingCopied, setGlobalRetargetingCopied] = useState(false);

  const [showPostbackModal, setShowPostbackModal] = useState(false);
  const [postbackOfferId, setPostbackOfferId] = useState("");
  const [postbackEventsOnly, setPostbackEventsOnly] = useState(false);
  const [postbackType, setPostbackType] = useState("S2S");
  const [postbackUrlCopied, setPostbackUrlCopied] = useState(false);
  const [postbackTokens, setPostbackTokens] = useState({
    ClickID: true,
    AdvSub1: false,
    AdvSub2: false,
    AdvSub3: false,
    AdvSub4: false,
    AdvSub5: false,
    Sale: false,
    Payout: false,
    Currency: false,
  });

  const [othersView, setOthersView] = useState("grid");
  const [postbackLogsOfferId, setPostbackLogsOfferId] = useState("");
  const [postbackLogsDateStart, setPostbackLogsDateStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [postbackLogsDateEnd, setPostbackLogsDateEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [postbackLogsShowEntries, setPostbackLogsShowEntries] = useState(20);
  const [affPostbackLogsTestOnly, setAffPostbackLogsTestOnly] = useState(false);
  const [affPostbackLogsOfferId, setAffPostbackLogsOfferId] = useState("");
  const [affPostbackLogsAffiliateId, setAffPostbackLogsAffiliateId] = useState("");
  const [affPostbackLogsDateStart, setAffPostbackLogsDateStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [affPostbackLogsDateEnd, setAffPostbackLogsDateEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [affPostbackLogsShowEntries, setAffPostbackLogsShowEntries] = useState(20);

  const [reportsActiveTemplate, setReportsActiveTemplate] = useState("basic");
  const [reportsPeriodStart, setReportsPeriodStart] = useState(() => `${new Date().toISOString().slice(0, 10)}T00:00:00`);
  const [reportsPeriodEnd, setReportsPeriodEnd] = useState(() => `${new Date().toISOString().slice(0, 10)}T23:59:59`);
  const [reportsShowEntries, setReportsShowEntries] = useState(100);

  const [conversionLogsOfferId, setConversionLogsOfferId] = useState("");
  const [conversionLogsDateStart, setConversionLogsDateStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [conversionLogsDateEnd, setConversionLogsDateEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [conversionLogsShowEntries, setConversionLogsShowEntries] = useState(20);

  const [cappingLogsOfferId, setCappingLogsOfferId] = useState("");
  const [cappingLogsAffiliateId, setCappingLogsAffiliateId] = useState("");
  const [cappingLogsPeriodStart, setCappingLogsPeriodStart] = useState(() => `${new Date().toISOString().slice(0, 10)}T00:00:00`);
  const [cappingLogsPeriodEnd, setCappingLogsPeriodEnd] = useState(() => `${new Date().toISOString().slice(0, 10)}T23:59:59`);
  const [cappingLogsShowEntries, setCappingLogsShowEntries] = useState(100);

  const [changeLogsOfferId, setChangeLogsOfferId] = useState("");
  const [changeLogsAdvertiserId, setChangeLogsAdvertiserId] = useState("");
  const [changeLogsAffiliateId, setChangeLogsAffiliateId] = useState("");
  const [changeLogsDateStart, setChangeLogsDateStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [changeLogsDateEnd, setChangeLogsDateEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [changeLogsShowEntries, setChangeLogsShowEntries] = useState(100);

  const [showLinkTesterModal, setShowLinkTesterModal] = useState(false);
  const [linkTesterUrl, setLinkTesterUrl] = useState("");
  const [linkTesterOs, setLinkTesterOs] = useState("Android 7");
  const [linkTesterCountry, setLinkTesterCountry] = useState("United States");
  const [linkTesterResult, setLinkTesterResult] = useState("");

  const [showAffiliatePostbackTestModal, setShowAffiliatePostbackTestModal] = useState(false);
  const [affiliatePostbackTestMode, setAffiliatePostbackTestMode] = useState("normal");
  const [affiliatePostbackTestUrl, setAffiliatePostbackTestUrl] = useState("");
  const [affiliatePostbackTestUseragent, setAffiliatePostbackTestUseragent] = useState(
    "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36"
  );
  const [deepTestOfferId, setDeepTestOfferId] = useState("");
  const [deepTestClickDomain, setDeepTestClickDomain] = useState("demo40.o18.click");
  const [deepTestTrackingUrl, setDeepTestTrackingUrl] = useState("");
  const [deepTestFirePostbackUrl] = useState("");

  const [showAffiliatePostbackModal, setShowAffiliatePostbackModal] = useState(false);
  const [affiliatePostbackOfferId, setAffiliatePostbackOfferId] = useState("");
  const [affiliatePostbackAffiliateId, setAffiliatePostbackAffiliateId] = useState("");
  const [affiliatePostbackRows, setAffiliatePostbackRows] = useState([]);

  const [showAddPostbackModal, setShowAddPostbackModal] = useState(false);
  const [addPostbackForm, setAddPostbackForm] = useState({
    position: "Offer Postback",
    offerId: "",
    affiliateId: "",
    event: "",
    integrationType: "Default",
    postbackType: "S2S",
    url: "",
    advanceSetup: false,
  });

  const navigate = useNavigate();
  const isEditMode = Boolean(editOfferId);
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
  const [editingOffer, setEditingOffer] = useState(null);

  useEffect(() => {
    if (!isEditMode) return undefined;

    const controller = new AbortController();
    const loadOffer = async () => {
      try {
        setOfferSaving(true);
        setOfferSaveError("");
        const response = await fetch(`https://localhost:7150/api/Offers/${editOfferId}`, {
          headers: { accept: "*/*" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load offer");

        const offer = await response.json();
        if (controller.signal.aborted) return;

        setEditingOffer(offer);
        setCreatedOfferId(offer.id || Number(editOfferId));
        setFormData((previous) => ({
          ...previous,
          offerType: offer.offerType || previous.offerType,
          offerName: offer.offerName || "",
          uploadLogo: offer.uploadLogo || null,
          advertiser: offer.advertiserId == null ? "" : String(offer.advertiserId),
          offerCategory: offer.offerCategoryName || "",
          appId: offer.appId || "",
          externalOfferId: offer.externalOfferId || "",
          offerPreviewUrl: offer.offerPreviewUrl || "",
          offerUrl: offer.offerUrl || "",
          advertiserUrlBuilder: offer.advertiserUrlBuilder || "",
          landingPage: offer.landingPage || "",
          tokens: offer.tokens || "",
          advertiserModel: offer.advertiserModel || "",
          advertiserPrice: String(offer.advertiserPrice ?? 0),
          advertiserCurrency: offer.advertiserCurrency || "",
          affiliateModel: offer.affiliateModel || "",
          affiliatePrice: String(offer.affiliatePrice ?? 0),
          affiliateCurrency: offer.affiliateCurrency || "",
          hidePayout: Boolean(offer.hidePayout),
          startDate: offer.startDate ? offer.startDate.slice(0, 16) : "",
          endDate: offer.endDate ? offer.endDate.slice(0, 16) : "",
          dailyStartTime: offer.dailyStartTime || "00:00:00",
          dailyEndTime: offer.dailyEndTime || "00:00:00",
          dailyScheduleEnabled: Boolean(offer.dailyScheduleEnabled),
          offerVisibility: offer.offerVisibility || previous.offerVisibility,
          status: offer.status || previous.status,
          alertToAffiliates: Boolean(offer.alertToAffiliates),
          deepLinks: Boolean(offer.deepLinks),
          terms: offer.terms || "",
          offerDescription: offer.offerDescription || "",
          privateNote: offer.privateNote || "",
          paOfferTerms: offer.paOfferTerms || "",
          styles: offer.styles || "",
        }));
      } catch (error) {
        if (error.name !== "AbortError") setOfferSaveError("Unable to load this offer. Please try again.");
      } finally {
        if (!controller.signal.aborted) setOfferSaving(false);
      }
    };

    loadOffer();
    return () => controller.abort();
  }, [editOfferId, isEditMode]);

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
    if (!showLandingPageModal && !showTrackingUrlModal && !payoutRuleFormOpen) return;
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
  }, [showLandingPageModal, showTrackingUrlModal, payoutRuleFormOpen]);

  useEffect(() => {
    if (!showTrackingUrlModal && !showPostbackModal && activePlaceholderTab !== "fallback" && activePlaceholderTab !== "suppression" && activePlaceholderTab !== "others") return;
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
  }, [showTrackingUrlModal, showPostbackModal, activePlaceholderTab]);

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

  useEffect(() => {
    if (!editingOffer?.offerCategoryId || editingOffer.offerCategoryName || categories.length === 0) return;
    const category = categories.find((item) => Number(item.id) === Number(editingOffer.offerCategoryId));
    if (category) setFormData((previous) => ({ ...previous, offerCategory: category.offerCategoryName }));
  }, [categories, editingOffer]);

  const advertiserName = (advertiser) =>
    [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || "Unnamed Advertiser";

  const advertiserInitials = (advertiser) =>
    advertiserName(advertiser).split(" ").filter(Boolean).slice(0, 2).map((name) => name[0]).join("").toUpperCase();

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || affiliate.email || "Unnamed Affiliate";

  const affiliateInitials = (affiliate) =>
    affiliateName(affiliate).split(" ").filter(Boolean).slice(0, 2).map((name) => name[0]).join("").toUpperCase();

  const affiliateAvatarPalette = ["#e5534b", "#57528e", "#a868f5", "#20b855", "#f4b900", "#00a9f4"];
  const affiliateAvatarColor = (affiliate) => {
    const id = Number(affiliate.id) || 0;
    return affiliateAvatarPalette[id % affiliateAvatarPalette.length];
  };

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

  const loadCappingRules = async () => {
    try {
      setCappingRulesLoading(true);
      setCappingRuleError("");
      const offerId = createdOfferId || editOfferId;
      const url = offerId ? `https://localhost:7150/api/CappingRules?offerId=${offerId}` : "https://localhost:7150/api/CappingRules";
      const response = await fetch(url, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load capping rules");
      const data = await response.json();
      setCappingRules(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setCappingRuleError("Unable to load capping rules. Please check the API and try again.");
    } finally {
      setCappingRulesLoading(false);
    }
  };

  const resetCappingRuleForm = () => {
    setCappingRule({
      ruleName: "",
      ruleType: "Advertiser Capping",
      cappingType: "Gross Conversions (advertiser)",
      period: "Daily",
      cappingValue: "",
      overCappingAction: "Stop Offer",
      cappingTimezoneEnabled: false,
      events: "",
      affiliateVisibility: "Show",
      enableRule: true,
      notificationEmail: "",
      earlierNotificationThreshold: "",
    });
    setEditingCappingRuleId(null);
  };

  const editCappingRule = (rule) => {
    setCappingRule({
      ruleName: rule.ruleName || "",
      ruleType: rule.ruleType || "Advertiser Capping",
      cappingType: rule.cappingType || "Gross Conversions (advertiser)",
      period: rule.period || "Daily",
      cappingValue: rule.cappingValue == null ? "" : String(rule.cappingValue),
      overCappingAction: rule.overCappingAction || "Stop Offer",
      cappingTimezoneEnabled: Boolean(rule.cappingTimezoneEnabled),
      events: rule.events || "",
      affiliateVisibility: rule.affiliateVisibility || "Show",
      enableRule: rule.enableRule !== false,
      notificationEmail: rule.notificationEmail || "",
      earlierNotificationThreshold: rule.earlierNotificationThreshold == null ? "" : String(rule.earlierNotificationThreshold),
    });
    setEditingCappingRuleId(rule.id);
    setCappingFormOpen(true);
  };

  const deleteCappingRule = async (id) => {
    if (!window.confirm("Delete this capping rule?")) return;
    try {
      setCappingRuleError("");
      const response = await fetch(`https://localhost:7150/api/CappingRules/${id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete capping rule");
      await loadCappingRules();
    } catch {
      setCappingRuleError("Unable to delete the capping rule. Please check the API and try again.");
    }
  };

  useEffect(() => {
    if (activePlaceholderTab === "capping") loadCappingRules();
  }, [activePlaceholderTab]);

  const loadEventSettings = async () => {
    const offerId = createdOfferId || editOfferId;
    if (!offerId) return;
    try {
      setEventSettingsLoading(true);
      const response = await fetch(`https://localhost:7150/api/EventSettings?offerId=${offerId}`, { headers: { accept: "*/*" } });
      if (response.status === 404) {
        setEventSettingsId(null);
        return;
      }
      if (!response.ok) throw new Error("Unable to load event settings");
      const data = await response.json();
      setEventSettingsId(data.id);
      setEventSettings({
        conversionWaitingTime: data.conversionWaitingTime || "30 Days",
        multiConversion: data.multiConversion || "Allow Multi Conversions",
        conversionApproval: data.conversionApproval || "Auto",
        multiConversionIp: data.multiConversionIp || "Allow from Same IP",
        defaultPostbackEvent: data.defaultPostbackEvent || "initial - default",
        eventMismatchAction: data.eventMismatchAction || "Record Conversion as initial Event",
      });
    } catch {
      // Keep the current defaults if event settings can't be loaded.
    } finally {
      setEventSettingsLoading(false);
    }
  };

  const loadPayoutRules = async () => {
    const offerId = createdOfferId || editOfferId;
    try {
      setPayoutRulesLoading(true);
      setPayoutRuleError("");
      const url = offerId ? `https://localhost:7150/api/PayoutRules?offerId=${offerId}` : "https://localhost:7150/api/PayoutRules";
      const response = await fetch(url, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load payout rules");
      const data = await response.json();
      const rules = (Array.isArray(data) ? data : data.items || data.data || []).map((rule) => ({
        ...rule,
        conditions: (() => {
          try {
            const parsed = JSON.parse(rule.conditionsJson || "[]");
            return Array.isArray(parsed) && parsed.length ? parsed : [
              { type: "Affiliate ID", operator: "is equal", value: "" },
              { type: "Event", operator: "is equal", value: "initial" },
              { type: "Country", operator: "is equal", value: "" },
            ];
          } catch {
            return [
              { type: "Affiliate ID", operator: "is equal", value: "" },
              { type: "Event", operator: "is equal", value: "initial" },
              { type: "Country", operator: "is equal", value: "" },
            ];
          }
        })(),
      }));
      setPayoutRules(rules);
    } catch {
      setPayoutRuleError("Unable to load payout rules. Please check the API and try again.");
    } finally {
      setPayoutRulesLoading(false);
    }
  };

  const loadEvents = async () => {
    const offerId = createdOfferId || editOfferId;
    try {
      setEventsLoading(true);
      setEventsError("");
      const url = offerId ? `https://localhost:7150/api/EventGoals?offerId=${offerId}` : "https://localhost:7150/api/EventGoals";
      const response = await fetch(url, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load events");
      const data = await response.json();
      const rows = (Array.isArray(data) ? data : data.items || data.data || []).map((row) => ({
        id: row.id,
        event: row.eventName,
        token: row.token,
        multiConversion: row.multiConversion || "Allow",
        multiConversionIp: row.multiConversionIp || "Allow",
        approval: row.approval || "Auto",
      }));
      setEvents(rows);
    } catch {
      setEventsError("Unable to load events. Please check the API and try again.");
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (activePlaceholderTab === "events") {
      loadEventSettings();
      loadPayoutRules();
      loadEvents();
    }
  }, [activePlaceholderTab]);

  useEffect(() => {
    if (activePlaceholderTab === "fallback") loadFallbackIntegration();
  }, [activePlaceholderTab]);

  useEffect(() => {
    if (showAddPostbackModal) loadEvents();
  }, [showAddPostbackModal]);

  useEffect(() => {
    if (activePlaceholderTab === "automation" && automationView === "list") loadAutomationRules();
  }, [activePlaceholderTab, automationView]);

  useEffect(() => {
    if (activePlaceholderTab === "suppression" && suppressionView === "list") loadSuppressionLists();
  }, [activePlaceholderTab, suppressionView]);

  useEffect(() => {
    if (activePlaceholderTab === "retargeting" && retargetingView === "list") loadRetargetingTags();
  }, [activePlaceholderTab, retargetingView]);

  useEffect(() => {
    if (activePlaceholderTab === "retargeting" || showAffiliatePostbackModal || othersView === "affiliate-postback-logs" || othersView === "capping-logs" || othersView === "change-logs") loadAffiliatesForModals();
  }, [activePlaceholderTab, showAffiliatePostbackModal, othersView]);

  useEffect(() => {
    if (activeStep === 2 || activeStep === 3) loadLandingPages();
  }, [activeStep]);

  useEffect(() => {
    if (activeStep === 4) loadCreatives();
  }, [activeStep]);

  useEffect(() => {
    if (activeStep !== 3 && !payoutRuleFormOpen && !showLinkTesterModal) return undefined;
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
  }, [activeStep, payoutRuleFormOpen, showLinkTesterModal]);

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
        const { advertiser, offerCategory, uploadLogo, ...offerFields } = formData;
        const response = await fetch(isEditMode ? `https://localhost:7150/api/Offers/${editOfferId}` : "https://localhost:7150/api/Offers", {
          method: isEditMode ? "PUT" : "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify({
            id: 0,
            ...offerFields,
            uploadLogo: typeof uploadLogo === "string" ? uploadLogo : uploadLogo?.name || "",
            advertiserId: Number(advertiser),
            offerCategoryId: selectedCategory?.id || editingOffer?.offerCategoryId || 0,
            advertiserPrice: Number(formData.advertiserPrice) || 0,
            affiliatePrice: Number(formData.affiliatePrice) || 0,
            startDate: toUtcIsoString(formData.startDate),
            endDate: toUtcIsoString(formData.endDate),
            createdOn: editingOffer?.createdOn || now,
            createdBy: editingOffer?.createdBy || user?.email || user?.name || "Admin",
            modifiedOn: now,
            modifiedBy: user?.email || user?.name || "Admin",
            isActive: editingOffer?.isActive ?? true,
          }),
        });

        if (!response.ok) throw new Error("Unable to save offer");
        const savedOffer = await response.json().catch(() => null);
        setCreatedOfferId(savedOffer?.id || savedOffer?.data?.id || 0);
      } catch {
        setOfferSaveError(`Unable to ${isEditMode ? "update" : "save"} the offer. Please check the API and try again.`);
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

  const selectEditTab = (tab) => {
    if (tab.key === "more") {
      setMoreMenuOpen((open) => !open);
      return;
    }
    if (tab.step) {
      setActivePlaceholderTab(null);
      setActiveStep(tab.step);
    } else {
      setActivePlaceholderTab(tab.key);
      if (tab.key === "automation") setAutomationView("list");
    }
    setMoreMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const selectMoreMenuItem = (item) => {
    setActivePlaceholderTab(item.key);
    if (item.key === "suppression") setSuppressionView("list");
    if (item.key === "retargeting") setRetargetingView("list");
    if (item.key === "others") setOthersView("grid");
    setMoreMenuOpen(false);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (!moreMenuOpen) return undefined;
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreMenuOpen]);

  const updateCappingRule = (field, value) => {
    setCappingRule((current) => ({ ...current, [field]: value }));
  };

  const submitCappingRule = async () => {
    if (!cappingRule.ruleName.trim()) {
      setCappingRuleError("Please enter a rule name.");
      return;
    }

    try {
      setCappingRuleSaving(true);
      setCappingRuleError("");
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        id: editingCappingRuleId || 0,
        offerId: Number(createdOfferId || editOfferId) || 0,
        ruleName: cappingRule.ruleName.trim(),
        ruleType: cappingRule.ruleType,
        cappingType: cappingRule.cappingType,
        period: cappingRule.period,
        cappingValue: Number(cappingRule.cappingValue) || 0,
        overCappingAction: cappingRule.overCappingAction,
        cappingTimezoneEnabled: cappingRule.cappingTimezoneEnabled,
        events: cappingRule.events,
        affiliateVisibility: cappingRule.affiliateVisibility,
        enableRule: cappingRule.enableRule,
        notificationEmail: cappingRule.notificationEmail,
        earlierNotificationThreshold: Number(cappingRule.earlierNotificationThreshold) || 0,
        createdOn: now,
        createdBy: user?.email || user?.name || "Admin",
        modifiedOn: now,
        modifiedBy: user?.email || user?.name || "Admin",
        isActive: true,
      };

      const response = await fetch(
        editingCappingRuleId ? `https://localhost:7150/api/CappingRules/${editingCappingRuleId}` : "https://localhost:7150/api/CappingRules",
        {
          method: editingCappingRuleId ? "PUT" : "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Unable to save capping rule");

      resetCappingRuleForm();
      setCappingFormOpen(false);
      await loadCappingRules();
    } catch {
      setCappingRuleError("Unable to save the capping rule. Please check the API and try again.");
    } finally {
      setCappingRuleSaving(false);
    }
  };

  const removeCappingRule = async () => {
    if (editingCappingRuleId) {
      await deleteCappingRule(editingCappingRuleId);
    }
    resetCappingRuleForm();
    setCappingFormOpen(false);
  };

  const updateEventSetting = (field, value) => {
    setEventSettings((current) => ({ ...current, [field]: value }));
  };

  const submitEventSettings = async () => {
    try {
      setEventSettingsSaving(true);
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        id: eventSettingsId || 0,
        offerId: Number(createdOfferId || editOfferId) || 0,
        ...eventSettings,
        createdOn: now,
        createdBy: user?.email || user?.name || "Admin",
        modifiedOn: now,
        modifiedBy: user?.email || user?.name || "Admin",
        isActive: true,
      };

      const response = await fetch(
        eventSettingsId ? `https://localhost:7150/api/EventSettings/${eventSettingsId}` : "https://localhost:7150/api/EventSettings",
        {
          method: eventSettingsId ? "PUT" : "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Unable to save event settings");

      if (!eventSettingsId) {
        const saved = await response.json().catch(() => null);
        if (saved?.id) setEventSettingsId(saved.id);
      }

      setEventSettingsMessage("Event settings saved.");
      window.setTimeout(() => setEventSettingsMessage(""), 3000);
    } catch {
      setEventSettingsMessage("Unable to save event settings. Please check the API and try again.");
    } finally {
      setEventSettingsSaving(false);
    }
  };

  const resetPayoutRuleForm = () => {
    setPayoutRuleForm({
      ruleName: "",
      revenueModel: "",
      revenueValue: "0",
      payoutModel: "",
      payoutValue: "0",
      currency: "",
      conditions: [
        { type: "Affiliate ID", operator: "is equal", value: "" },
        { type: "Event", operator: "is equal", value: "initial" },
        { type: "Country", operator: "is equal", value: "" },
      ],
      affiliateVisibility: "Show",
      rulePriority: "10 High",
      enableRule: true,
    });
    setEditingPayoutRuleId(null);
  };

  const addPayoutRule = () => {
    if (payoutRuleFormOpen) {
      setPayoutRuleFormOpen(false);
    } else {
      resetPayoutRuleForm();
      setPayoutRuleFormOpen(true);
    }
  };

  const importPayoutRules = () => {
    alert("Choose a .csv file of payout rules to import (not connected to a file picker yet).");
  };

  const updatePayoutRuleForm = (field, value) => {
    setPayoutRuleForm((current) => ({ ...current, [field]: value }));
  };

  const updatePayoutRuleCondition = (index, field, value) => {
    setPayoutRuleForm((current) => ({
      ...current,
      conditions: current.conditions.map((condition, conditionIndex) =>
        conditionIndex === index ? { ...condition, [field]: value } : condition
      ),
    }));
  };

  const addPayoutRuleCondition = () => {
    setPayoutRuleForm((current) => ({
      ...current,
      conditions: [...current.conditions, { type: "Custom", operator: "is equal", value: "" }],
    }));
  };

  const filteredPayoutAffiliates = affiliates.filter((affiliate) => {
    const searchText = `${affiliate.id} ${affiliateName(affiliate)}`.toLowerCase();
    return searchText.includes(payoutAffiliateSearch.trim().toLowerCase());
  });

  const selectPayoutConditionAffiliate = (index, affiliate) => {
    updatePayoutRuleCondition(index, "value", String(affiliate.id));
    setOpenAffiliateConditionIndex(null);
    setPayoutAffiliateSearch("");
  };

  const renderPayoutConditionValue = (condition, index) => {
    if (condition.type === "Affiliate ID") {
      const selectedAffiliate = affiliates.find((affiliate) => String(affiliate.id) === String(condition.value));
      const isOpen = openAffiliateConditionIndex === index;
      return (
        <div className="select-with-button advertiser-picker payout-affiliate-picker">
          <button
            type="button"
            className="advertiser-picker-trigger"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onClick={() => {
              setOpenAffiliateConditionIndex((current) => (current === index ? null : index));
              setPayoutAffiliateSearch("");
            }}
          >
            <span>{selectedAffiliate ? `${selectedAffiliate.id} ~ ${affiliateName(selectedAffiliate)}` : "Select Affiliate"}</span>
            <span aria-hidden="true">▾</span>
          </button>
          {isOpen && (
            <div className="advertiser-picker-menu" role="listbox" aria-label="Affiliates">
              <input
                type="search"
                autoFocus
                value={payoutAffiliateSearch}
                onChange={(event) => setPayoutAffiliateSearch(event.target.value)}
                placeholder="Select Affiliate"
                aria-label="Search affiliates"
              />
              <div className="advertiser-picker-options">
                {affiliatesLoading && <p>Loading affiliates…</p>}
                {!affiliatesLoading && filteredPayoutAffiliates.length === 0 && <p>No affiliates found</p>}
                {filteredPayoutAffiliates.map((affiliate) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={String(affiliate.id) === String(condition.value)}
                    className="advertiser-picker-option"
                    key={affiliate.id}
                    onClick={() => selectPayoutConditionAffiliate(index, affiliate)}
                  >
                    <span className="advertiser-avatar" style={{ background: affiliateAvatarColor(affiliate) }}>{affiliateInitials(affiliate)}</span>
                    <span><strong>{affiliate.id} ~ {affiliateName(affiliate)}</strong><small>{affiliate.status || affiliate.role || "Affiliate"}</small></span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (condition.type === "Event") {
      return (
        <select value={condition.value} onChange={(event) => updatePayoutRuleCondition(index, "value", event.target.value)}>
          <option value="">Select Event</option>
          <option value="initial">initial</option>
          {events.map((row) => <option key={row.id} value={row.event}>{row.event}</option>)}
        </select>
      );
    }

    if (condition.type === "Country") {
      return (
        <select value={condition.value} onChange={(event) => updatePayoutRuleCondition(index, "value", event.target.value)} disabled={countriesLoading}>
          <option value="">{countriesLoading ? "Loading countries..." : "Select Country"}</option>
          {countryOptions.map((country) => <option key={country} value={country}>{country}</option>)}
        </select>
      );
    }

    return (
      <input
        type="text"
        value={condition.value}
        placeholder={`Select ${condition.type}`}
        onChange={(event) => updatePayoutRuleCondition(index, "value", event.target.value)}
      />
    );
  };

  const editPayoutRule = (rule) => {
    setPayoutRuleForm(rule);
    setEditingPayoutRuleId(rule.id);
    setPayoutRuleFormOpen(true);
  };

  const submitPayoutRuleForm = async () => {
    if (!payoutRuleForm.ruleName.trim()) {
      setPayoutRuleError("Please enter a rule name.");
      return;
    }

    try {
      setPayoutRuleSaving(true);
      setPayoutRuleError("");
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        id: editingPayoutRuleId || 0,
        offerId: Number(createdOfferId || editOfferId) || 0,
        ruleName: payoutRuleForm.ruleName.trim(),
        revenueModel: payoutRuleForm.revenueModel,
        revenueValue: Number(payoutRuleForm.revenueValue) || 0,
        payoutModel: payoutRuleForm.payoutModel,
        payoutValue: Number(payoutRuleForm.payoutValue) || 0,
        currency: payoutRuleForm.currency,
        conditionsJson: JSON.stringify(payoutRuleForm.conditions),
        affiliateVisibility: payoutRuleForm.affiliateVisibility,
        rulePriority: payoutRuleForm.rulePriority,
        enableRule: payoutRuleForm.enableRule,
        createdOn: now,
        createdBy: user?.email || user?.name || "Admin",
        modifiedOn: now,
        modifiedBy: user?.email || user?.name || "Admin",
        isActive: true,
      };

      const response = await fetch(
        editingPayoutRuleId ? `https://localhost:7150/api/PayoutRules/${editingPayoutRuleId}` : "https://localhost:7150/api/PayoutRules",
        {
          method: editingPayoutRuleId ? "PUT" : "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Unable to save payout rule");

      resetPayoutRuleForm();
      setPayoutRuleFormOpen(false);
      await loadPayoutRules();
    } catch {
      setPayoutRuleError("Unable to save the payout rule. Please check the API and try again.");
    } finally {
      setPayoutRuleSaving(false);
    }
  };

  const deletePayoutRule = async (id) => {
    if (!window.confirm("Delete this payout rule?")) return;
    try {
      setPayoutRuleError("");
      const response = await fetch(`https://localhost:7150/api/PayoutRules/${id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete payout rule");
      await loadPayoutRules();
    } catch {
      setPayoutRuleError("Unable to delete the payout rule. Please check the API and try again.");
    }
  };

  const updateEventRow = async (id, field, value) => {
    setEvents((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

    const row = events.find((item) => item.id === id);
    if (!row) return;
    const updatedRow = { ...row, [field]: value };

    try {
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("user") || "null");
      await fetch(`https://localhost:7150/api/EventGoals/${id}`, {
        method: "PUT",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          offerId: Number(createdOfferId || editOfferId) || 0,
          eventName: updatedRow.event,
          token: updatedRow.token,
          multiConversion: updatedRow.multiConversion,
          multiConversionIp: updatedRow.multiConversionIp,
          approval: updatedRow.approval,
          modifiedOn: now,
          modifiedBy: user?.email || user?.name || "Admin",
          isActive: true,
        }),
      });
    } catch {
      setEventsError("Unable to save this event's changes. Please check the API and try again.");
    }
  };

  const createEvent = async () => {
    try {
      setEventsError("");
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const response = await fetch("https://localhost:7150/api/EventGoals", {
        method: "POST",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        body: JSON.stringify({
          id: 0,
          offerId: Number(createdOfferId || editOfferId) || 0,
          eventName: "New Event",
          token: "",
          multiConversion: "Allow",
          multiConversionIp: "Allow",
          approval: "Auto",
          createdOn: now,
          createdBy: user?.email || user?.name || "Admin",
          modifiedOn: now,
          modifiedBy: user?.email || user?.name || "Admin",
          isActive: true,
        }),
      });
      if (!response.ok) throw new Error("Unable to create event");
      await loadEvents();
    } catch {
      setEventsError("Unable to create the event. Please check the API and try again.");
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      setEventsError("");
      const response = await fetch(`https://localhost:7150/api/EventGoals/${id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete event");
      await loadEvents();
    } catch {
      setEventsError("Unable to delete the event. Please check the API and try again.");
    }
  };

  const updateFallbackForm = (field, value) => {
    setFallbackForm((current) => ({ ...current, [field]: value }));
  };

  const loadFallbackIntegration = async () => {
    const offerId = createdOfferId || editOfferId;
    if (!offerId) return;
    try {
      setFallbackLoading(true);
      const response = await fetch(`https://localhost:7150/api/FallbackIntegrations?offerId=${offerId}`, { headers: { accept: "*/*" } });
      if (response.status === 404) {
        setFallbackId(null);
        return;
      }
      if (!response.ok) throw new Error("Unable to load fallback / integration settings");
      const data = await response.json();
      setFallbackId(data.id);
      setFallbackForm({
        postbackType: data.postbackType || "all",
        enableFallback: data.enableFallback || "Disabled",
        fallbackUrl: data.fallbackUrl || "",
        fallbackOffer: data.fallbackOfferId == null ? "" : String(data.fallbackOfferId),
        fallbackOfferReportsAffiliates: data.fallbackOfferReportsAffiliates || "Disabled",
        htmlJsCode: data.htmlJsCode || "",
        urlToReplace: data.urlToReplace || "",
        erid: data.erid || "",
        forceAffiliateLandingRedirect: data.forceAffiliateLandingRedirect || "disable",
      });
    } catch {
      // Keep the current defaults if fallback/integration settings can't be loaded.
    } finally {
      setFallbackLoading(false);
    }
  };

  const submitFallbackForm = async () => {
    try {
      setFallbackSaving(true);
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        id: fallbackId || 0,
        offerId: Number(createdOfferId || editOfferId) || 0,
        postbackType: fallbackForm.postbackType,
        enableFallback: fallbackForm.enableFallback,
        fallbackUrl: fallbackForm.fallbackUrl,
        fallbackOfferId: fallbackForm.fallbackOffer ? Number(fallbackForm.fallbackOffer) : null,
        fallbackOfferReportsAffiliates: fallbackForm.fallbackOfferReportsAffiliates,
        htmlJsCode: fallbackForm.htmlJsCode,
        urlToReplace: fallbackForm.urlToReplace,
        erid: fallbackForm.erid,
        forceAffiliateLandingRedirect: fallbackForm.forceAffiliateLandingRedirect,
        createdOn: now,
        createdBy: user?.email || user?.name || "Admin",
        modifiedOn: now,
        modifiedBy: user?.email || user?.name || "Admin",
        isActive: true,
      };

      const response = await fetch(
        fallbackId ? `https://localhost:7150/api/FallbackIntegrations/${fallbackId}` : "https://localhost:7150/api/FallbackIntegrations",
        {
          method: fallbackId ? "PUT" : "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Unable to save fallback / integration settings");

      if (!fallbackId) {
        const saved = await response.json().catch(() => null);
        if (saved?.id) setFallbackId(saved.id);
      }

      setFallbackMessage("Fallback / Integration settings saved.");
      window.setTimeout(() => setFallbackMessage(""), 3000);
    } catch {
      setFallbackMessage("Unable to save fallback / integration settings. Please check the API and try again.");
    } finally {
      setFallbackSaving(false);
    }
  };

  const submitAndNextFallback = async () => {
    await submitFallbackForm();
    setActivePlaceholderTab("events");
    window.scrollTo(0, 0);
  };

  const updateAntiFraudForm = (field, value) => {
    setAntiFraudForm((current) => ({ ...current, [field]: value }));
  };

  const updateClickBlockFilter = (key, value) => {
    setClickBlockFilters((current) => ({ ...current, [key]: value }));
  };

  const updateConversionValidateFilter = (key, field, value) => {
    setConversionValidateFilters((current) => ({
      ...current,
      [key]: { ...current[key], [field]: value },
    }));
  };

  const updateCtitRule = (id, field, value) => {
    setCtitRules((rules) => rules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)));
  };

  const addCtitRuleTo = (id, value) => {
    if (!value) return;
    setCtitRules((rules) => rules.map((rule) => (
      rule.id === id && !rule.to.includes(value) ? { ...rule, to: [...rule.to, value] } : rule
    )));
  };

  const removeCtitRuleTo = (id, value) => {
    setCtitRules((rules) => rules.map((rule) => (
      rule.id === id ? { ...rule, to: rule.to.filter((item) => item !== value) } : rule
    )));
  };

  const addCtitRule = () => {
    setCtitRules((rules) => [...rules, { id: Date.now(), from: "Click", to: ["All"], minSeconds: "0", maxSeconds: "2678400", then: "Accept Conversion" }]);
  };

  const resetAntiFraudForm = () => {
    setAntiFraudForm({
      clickSpammingDefender: "",
      uniqueClickLimit: "",
      proxyBotBlock: "Disabled",
      browserBlankReferral: "Allow",
      defaultIpSource: "X Forwarded For ( server side )",
      clickIpv4RangeFilter: "Allow",
      clickIpv4RangeValues: "",
      htmlRedirectHttpReferral: "",
    });
    setClickBlockFilters(Object.fromEntries(clickBlockFilterKeys.map((key) => [key, ""])));
    setConversionValidateFilters(Object.fromEntries(conversionValidateFilterKeys.map((key) => [key, { value: "", mode: "" }])));
    setCtitRules([{ id: 1, from: "Click", to: ["All"], minSeconds: "0", maxSeconds: "2678400", then: "Accept Conversion" }]);
  };

  const submitAntiFraudForm = async () => {
    try {
      setAntiFraudSaving(true);
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        id: 0,
        offerId: Number(createdOfferId || editOfferId) || 0,
        ...antiFraudForm,
        clickBlockFiltersJson: JSON.stringify(clickBlockFilters),
        conversionValidateFiltersJson: JSON.stringify(conversionValidateFilters),
        ctitRulesJson: JSON.stringify(ctitRules.map((rule) => ({
          from: rule.from,
          to: rule.to,
          minSeconds: rule.minSeconds,
          maxSeconds: rule.maxSeconds,
          then: rule.then,
        }))),
        createdOn: now,
        createdBy: user?.email || user?.name || "Admin",
        modifiedOn: now,
        modifiedBy: user?.email || user?.name || "Admin",
        isActive: true,
      };

      // Every submit creates a brand new anti fraud settings entry (POST), rather than
      // updating a previous one, so the form always clears and is ready for the next entry.
      const response = await fetch("https://localhost:7150/api/AntiFraudSettings", {
        method: "POST",
        headers: { accept: "*/*", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Unable to save anti fraud settings");

      resetAntiFraudForm();
      setAntiFraudMessage("Anti fraud settings saved. You can add another entry.");
      window.setTimeout(() => setAntiFraudMessage(""), 3000);
    } catch {
      setAntiFraudMessage("Unable to save anti fraud settings. Please check the API and try again.");
    } finally {
      setAntiFraudSaving(false);
    }
  };

  const updateAutomationForm = (field, value) => {
    setAutomationForm((current) => ({ ...current, [field]: value }));
  };

  const openCreateAutomation = () => {
    const offerId = createdOfferId || editOfferId;
    setAutomationForm({
      ruleName: "",
      status: "Active",
      blockLevel: "Offer Level",
      advertiser: selectedAdvertiser ? `${selectedAdvertiser.id} ~ ${advertiserName(selectedAdvertiser)}` : "",
      offers: offerId ? [{ id: offerId, name: formData.offerName || "Untitled Offer" }] : [],
      conversion: "",
      clicks: "",
      impressions: "",
      field: "CR",
      compareType: "< Minimum Value",
      minValue: "0",
      maxValue: "",
      reportStatus: "",
      dataLookBack: "1 Hour",
      schedule: "10 Mint",
      dateStart: new Date().toISOString().slice(0, 10),
      dateEnd: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      whitelistOffers: "",
      resumeAfter: "1 Hour",
      alertEnabled: false,
    });
    setEditingAutomationRuleId(null);
    setAutomationView("form");
    window.scrollTo(0, 0);
  };

  const removeAutomationOfferChip = (id) => {
    setAutomationForm((current) => ({ ...current, offers: current.offers.filter((offer) => offer.id !== id) }));
  };

  const scrollToAutomationSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const editAutomationRule = (rule) => {
    setAutomationForm(rule.form);
    setEditingAutomationRuleId(rule.id);
    setAutomationView("form");
    window.scrollTo(0, 0);
  };

  const automationCompareSymbol = (compareType) => ((compareType || "").startsWith(">") ? ">" : (compareType || "").startsWith("=") ? "=" : "<");

  const automationSummaryFor = (data) => `${data.field || "CR"} ${automationCompareSymbol(data.compareType)} Min - / ${data.minValue || 0} - every ${data.schedule || "10 Mint"}`;

  const formatAutomationRelativeTime = (isoString) => {
    if (!isoString) return "";
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
    if (diffSec < 60) return `${diffSec} second${diffSec === 1 ? "" : "s"} ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  };

  const parseAutomationOffers = (offersJson) => {
    try {
      const parsed = JSON.parse(offersJson || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const buildAutomationFormFromApi = (data) => ({
    ruleName: data.ruleName || "",
    status: data.status || "Active",
    blockLevel: data.blockLevel || "Offer Level",
    advertiser: data.advertiser || "",
    offers: parseAutomationOffers(data.offersJson),
    conversion: data.conversion || "",
    clicks: data.clicks || "",
    impressions: data.impressions || "",
    field: data.field || "CR",
    compareType: data.compareType || "< Minimum Value",
    minValue: data.minValue ?? "0",
    maxValue: data.maxValue || "",
    reportStatus: data.reportStatus || "",
    dataLookBack: data.dataLookBack || "1 Hour",
    schedule: data.schedule || "10 Mint",
    dateStart: data.dateStart ? data.dateStart.slice(0, 10) : new Date().toISOString().slice(0, 10),
    dateEnd: data.dateEnd ? data.dateEnd.slice(0, 10) : new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    whitelistOffers: data.whitelistOffers || "",
    resumeAfter: data.resumeAfter || "1 Hour",
    alertEnabled: Boolean(data.alertEnabled),
  });

  const buildAutomationRow = (item) => ({
    id: item.id,
    ruleName: item.ruleName,
    summary: automationSummaryFor(item),
    blockLevel: item.blockLevel,
    field: item.field,
    status: item.status,
    lastCheck: item.lastCheck ? new Date(item.lastCheck).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "",
    lastCheckRelative: formatAutomationRelativeTime(item.lastCheck),
    alarm: item.alarm && item.alarm !== "none" ? item.alarm : "–",
    form: buildAutomationFormFromApi(item),
  });

  const loadAutomationRules = async () => {
    const offerId = createdOfferId || editOfferId;
    try {
      setAutomationRulesLoading(true);
      setAutomationRuleError("");
      const url = offerId ? `https://localhost:7150/api/AutomationRules?offerId=${offerId}` : "https://localhost:7150/api/AutomationRules";
      const response = await fetch(url, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load automation rules");
      const data = await response.json();
      const rows = (Array.isArray(data) ? data : data.items || data.data || []).map(buildAutomationRow);
      setAutomationRules(rows);
    } catch {
      setAutomationRuleError("Unable to load automation rules. Please check the API and try again.");
    } finally {
      setAutomationRulesLoading(false);
    }
  };

  const deleteAutomationRule = async (id) => {
    if (!window.confirm("Delete this automation rule?")) return;
    try {
      setAutomationRuleError("");
      const response = await fetch(`https://localhost:7150/api/AutomationRules/${id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete automation rule");
      await loadAutomationRules();
    } catch {
      setAutomationRuleError("Unable to delete the automation rule. Please check the API and try again.");
    }
  };

  const submitAutomationForm = async () => {
    if (!automationForm.ruleName.trim()) {
      alert("Please enter a rule name");
      return;
    }

    try {
      setAutomationSaving(true);
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        id: editingAutomationRuleId || 0,
        offerId: Number(createdOfferId || editOfferId) || 0,
        ruleName: automationForm.ruleName.trim(),
        status: automationForm.status,
        blockLevel: automationForm.blockLevel,
        advertiser: automationForm.advertiser,
        offersJson: JSON.stringify(automationForm.offers),
        conversion: automationForm.conversion,
        clicks: automationForm.clicks,
        impressions: automationForm.impressions,
        field: automationForm.field,
        compareType: automationForm.compareType,
        minValue: automationForm.minValue,
        maxValue: automationForm.maxValue,
        reportStatus: automationForm.reportStatus,
        dataLookBack: automationForm.dataLookBack,
        schedule: automationForm.schedule,
        dateStart: toUtcIsoString(automationForm.dateStart),
        dateEnd: toUtcIsoString(automationForm.dateEnd),
        whitelistOffers: automationForm.whitelistOffers,
        resumeAfter: automationForm.resumeAfter,
        alertEnabled: automationForm.alertEnabled,
        alarm: automationForm.alertEnabled ? "Alert" : "none",
        createdOn: now,
        createdBy: user?.email || user?.name || "Admin",
        modifiedOn: now,
        modifiedBy: user?.email || user?.name || "Admin",
        isActive: true,
      };

      const response = await fetch(
        editingAutomationRuleId ? `https://localhost:7150/api/AutomationRules/${editingAutomationRuleId}` : "https://localhost:7150/api/AutomationRules",
        {
          method: editingAutomationRuleId ? "PUT" : "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Unable to save automation rule");

      setAutomationView("list");
      await loadAutomationRules();
    } catch {
      alert("Unable to save the automation rule. Please check the API and try again.");
    } finally {
      setAutomationSaving(false);
    }
  };

  const updateSuppressionForm = (field, value) => {
    setSuppressionForm((current) => ({ ...current, [field]: value }));
  };

  const resetSuppressionForm = () => {
    const offerId = createdOfferId || editOfferId;
    setSuppressionForm({
      name: "",
      offerId: offerId ? String(offerId) : "",
      sourceType: "URL",
      url: "",
      unsubscribeUrl: "",
      subjectLines: "",
      fromLines: "",
    });
    setEditingSuppressionId(null);
  };

  const openCreateSuppression = () => {
    resetSuppressionForm();
    setSuppressionView("form");
    window.scrollTo(0, 0);
  };

  const loadSuppressionLists = async () => {
    // Suppression lists carry their own "OfferID" column and can be created against
    // any offer via the form's Offer picker, so the list view is not scoped to the
    // offer currently being edited — filtering here would hide entries saved against
    // a different offer, which is exactly the "list looks empty after save" bug.
    try {
      setSuppressionListsLoading(true);
      setSuppressionListError("");
      const response = await fetch("https://localhost:7150/api/SuppressionLists", { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load suppression lists");
      const data = await response.json();
      setSuppressionLists(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setSuppressionListError("Unable to load suppression lists. Please check the API and try again.");
    } finally {
      setSuppressionListsLoading(false);
    }
  };

  const editSuppressionList = (row) => {
    setSuppressionForm({
      name: row.name || "",
      offerId: row.offerId == null ? "" : String(row.offerId),
      sourceType: row.sourceType || "URL",
      url: row.url || "",
      unsubscribeUrl: row.unsubscribeUrl || "",
      subjectLines: row.subjectLines || "",
      fromLines: row.fromLines || "",
    });
    setEditingSuppressionId(row.id);
    setSuppressionView("form");
    window.scrollTo(0, 0);
  };

  const deleteSuppressionList = async (id) => {
    if (!window.confirm("Delete this suppression list?")) return;
    try {
      setSuppressionListError("");
      const response = await fetch(`https://localhost:7150/api/SuppressionLists/${id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete suppression list");
      await loadSuppressionLists();
    } catch {
      setSuppressionListError("Unable to delete the suppression list. Please check the API and try again.");
    }
  };

  const submitSuppressionForm = async () => {
    if (!suppressionForm.name.trim()) {
      alert("Please enter a suppression list name");
      return;
    }

    try {
      setSuppressionSaving(true);
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        id: editingSuppressionId || 0,
        offerId: Number(suppressionForm.offerId) || 0,
        name: suppressionForm.name.trim(),
        sourceType: suppressionForm.sourceType,
        url: suppressionForm.url,
        unsubscribeUrl: suppressionForm.unsubscribeUrl,
        subjectLines: suppressionForm.subjectLines,
        fromLines: suppressionForm.fromLines,
        createdOn: now,
        createdBy: user?.email || user?.name || "Admin",
        modifiedOn: now,
        modifiedBy: user?.email || user?.name || "Admin",
        isActive: true,
      };

      const response = await fetch(
        editingSuppressionId ? `https://localhost:7150/api/SuppressionLists/${editingSuppressionId}` : "https://localhost:7150/api/SuppressionLists",
        {
          method: editingSuppressionId ? "PUT" : "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Unable to save suppression list");

      setSuppressionView("list");
      await loadSuppressionLists();
    } catch {
      alert("Unable to save the suppression list. Please check the API and try again.");
    } finally {
      setSuppressionSaving(false);
    }
  };

  const updateRetargetingForm = (field, value) => {
    setRetargetingForm((current) => ({ ...current, [field]: value }));
  };

  const resetRetargetingForm = () => {
    setRetargetingForm({ tagName: "", affiliateId: "", url: "", code: "" });
    setEditingRetargetingId(null);
  };

  const openCreateRetargeting = () => {
    resetRetargetingForm();
    setRetargetingView("form");
    window.scrollTo(0, 0);
  };

  const loadRetargetingTags = async () => {
    try {
      setRetargetingTagsLoading(true);
      setRetargetingTagError("");
      const response = await fetch("https://localhost:7150/api/RetargetingTags", { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load retargeting tags");
      const data = await response.json();
      setRetargetingTags(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setRetargetingTagError("Unable to load retargeting tags. Please check the API and try again.");
    } finally {
      setRetargetingTagsLoading(false);
    }
  };

  const loadAffiliatesForModals = async () => {
    try {
      setAffiliatesLoading(true);
      const token = JSON.parse(localStorage.getItem("user") || "null")?.token;
      const response = await fetch("https://localhost:7029/api/Affiliates", {
        headers: { Accept: "*/*", Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!response.ok) throw new Error("Unable to load affiliates");
      const data = await response.json();
      setAffiliates(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setAffiliates([]);
    } finally {
      setAffiliatesLoading(false);
    }
  };

  const editRetargetingTag = (row) => {
    setRetargetingForm({
      tagName: row.tagName || "",
      affiliateId: row.affiliateId == null ? "" : String(row.affiliateId),
      url: row.url || "",
      code: row.code || "",
    });
    setEditingRetargetingId(row.id);
    setRetargetingView("form");
    window.scrollTo(0, 0);
  };

  const deleteRetargetingTag = async (id) => {
    if (!window.confirm("Delete this retargeting tag?")) return;
    try {
      setRetargetingTagError("");
      const response = await fetch(`https://localhost:7150/api/RetargetingTags/${id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete retargeting tag");
      await loadRetargetingTags();
    } catch {
      setRetargetingTagError("Unable to delete the retargeting tag. Please check the API and try again.");
    }
  };

  const copyGlobalRetargetingScript = async () => {
    try {
      await navigator.clipboard.writeText(GLOBAL_RETARGETING_SCRIPT);
      setGlobalRetargetingCopied(true);
      window.setTimeout(() => setGlobalRetargetingCopied(false), 2000);
    } catch {
      setGlobalRetargetingCopied(false);
    }
  };

  const handleOthersCardButton = (button) => {
    if (button.action === "postback") {
      setPostbackOfferId((current) => current || String(createdOfferId || editOfferId || ""));
      setShowPostbackModal(true);
      return;
    }
    if (button.action === "postback-logs") {
      const today = new Date().toISOString().slice(0, 10);
      setPostbackLogsOfferId((current) => current || String(createdOfferId || editOfferId || ""));
      setPostbackLogsDateStart(today);
      setPostbackLogsDateEnd(today);
      setOthersView("postback-logs");
      window.scrollTo(0, 0);
      return;
    }
    if (button.action === "affiliate-postback") {
      setAffiliatePostbackOfferId((current) => current || String(createdOfferId || editOfferId || ""));
      setShowAffiliatePostbackModal(true);
      return;
    }
    if (button.action === "affiliate-postback-test") {
      setAffiliatePostbackTestMode("normal");
      setAffiliatePostbackTestUrl("");
      setShowAffiliatePostbackTestModal(true);
      return;
    }
    if (button.action === "affiliate-postback-test-deep") {
      setAffiliatePostbackTestMode("deep");
      setDeepTestOfferId((current) => current || String(createdOfferId || editOfferId || ""));
      setDeepTestTrackingUrl("");
      setShowAffiliatePostbackTestModal(true);
      return;
    }
    if (button.action === "reports") {
      setReportsActiveTemplate("basic");
      const today = new Date().toISOString().slice(0, 10);
      setReportsPeriodStart(`${today}T00:00:00`);
      setReportsPeriodEnd(`${today}T23:59:59`);
      setOthersView("reports");
      window.scrollTo(0, 0);
      return;
    }
    if (button.action === "link-tester") {
      const domain = "demo40.offer18.com";
      const offerId = createdOfferId || editOfferId;
      setLinkTesterUrl(offerId ? `https://${domain}/m/#offer&step=create&offer_id=${offerId}` : `https://${domain}/m/#offer&step=create`);
      setLinkTesterOs("Android 7");
      setLinkTesterCountry("United States");
      setLinkTesterResult("");
      setShowLinkTesterModal(true);
      return;
    }
    if (button.action === "change-logs") {
      const today = new Date().toISOString().slice(0, 10);
      setChangeLogsDateStart(today);
      setChangeLogsDateEnd(today);
      setOthersView("change-logs");
      window.scrollTo(0, 0);
      return;
    }
    if (button.action === "capping-logs") {
      const today = new Date().toISOString().slice(0, 10);
      setCappingLogsPeriodStart(`${today}T00:00:00`);
      setCappingLogsPeriodEnd(`${today}T23:59:59`);
      setOthersView("capping-logs");
      window.scrollTo(0, 0);
      return;
    }
    if (button.action === "conversion-logs") {
      const today = new Date().toISOString().slice(0, 10);
      setConversionLogsOfferId((current) => current || String(createdOfferId || editOfferId || ""));
      setConversionLogsDateStart(today);
      setConversionLogsDateEnd(today);
      setOthersView("conversion-logs");
      window.scrollTo(0, 0);
      return;
    }
    if (button.action === "affiliate-postback-logs") {
      const today = new Date().toISOString().slice(0, 10);
      setAffPostbackLogsOfferId((current) => current || String(createdOfferId || editOfferId || ""));
      setAffPostbackLogsDateStart(today);
      setAffPostbackLogsDateEnd(today);
      setOthersView("affiliate-postback-logs");
      window.scrollTo(0, 0);
      return;
    }
    if (button.route) {
      navigate(button.route);
      return;
    }
    alert(`${button.label} is not connected yet.`);
  };

  const openAddPostback = (position) => {
    setAddPostbackForm({
      position,
      offerId: position === "Offer Postback" ? (affiliatePostbackOfferId || String(createdOfferId || editOfferId || "")) : "",
      affiliateId: affiliatePostbackAffiliateId || "",
      event: "",
      integrationType: "Default",
      postbackType: "S2S",
      url: "",
      advanceSetup: false,
    });
    setShowAddPostbackModal(true);
  };

  const updateAddPostbackForm = (field, value) => {
    setAddPostbackForm((current) => ({ ...current, [field]: value }));
  };

  const submitAddPostback = () => {
    if (addPostbackForm.position === "Offer Postback" && !addPostbackForm.offerId) {
      alert("Please select an offer.");
      return;
    }
    if (!addPostbackForm.url.trim()) {
      alert("Please enter a postback URL.");
      return;
    }

    const offer = offers.find((item) => String(item.id) === String(addPostbackForm.offerId));
    const affiliate = affiliates.find((item) => String(item.id) === String(addPostbackForm.affiliateId));
    const eventRow = events.find((item) => String(item.id) === String(addPostbackForm.event));

    setAffiliatePostbackRows((rows) => [...rows, {
      id: Date.now(),
      affiliateId: affiliate ? `${affiliate.id} ~ ${affiliateName(affiliate)}` : "All Affiliates",
      position: addPostbackForm.position,
      offerId: offer ? `${offer.id} ~ ${offer.offerName}` : "All Offers",
      event: eventRow ? eventRow.event : "All Events",
      integrationType: addPostbackForm.integrationType,
      type: addPostbackForm.postbackType,
      url: addPostbackForm.url,
      status: "Active",
      trigger: addPostbackForm.advanceSetup ? "Advance" : "Standard",
      updateTime: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    }]);

    setShowAddPostbackModal(false);
  };

  const postbackUrl = postbackOfferId
    ? `https://demo40.o18.click/p?o=${postbackOfferId}&m=4860&tid={REPLACE}`
    : "";

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

  const submitRetargetingForm = async () => {
    if (!retargetingForm.tagName.trim()) {
      alert("Please enter a tag name");
      return;
    }

    try {
      setRetargetingSaving(true);
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const payload = {
        id: editingRetargetingId || 0,
        affiliateId: retargetingForm.affiliateId ? Number(retargetingForm.affiliateId) : null,
        tagName: retargetingForm.tagName.trim(),
        url: retargetingForm.url,
        code: retargetingForm.code,
        createdOn: now,
        createdBy: user?.email || user?.name || "Admin",
        modifiedOn: now,
        modifiedBy: user?.email || user?.name || "Admin",
        isActive: true,
      };

      const response = await fetch(
        editingRetargetingId ? `https://localhost:7150/api/RetargetingTags/${editingRetargetingId}` : "https://localhost:7150/api/RetargetingTags",
        {
          method: editingRetargetingId ? "PUT" : "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Unable to save retargeting tag");

      setRetargetingView("list");
      await loadRetargetingTags();
    } catch {
      alert("Unable to save the retargeting tag. Please check the API and try again.");
    } finally {
      setRetargetingSaving(false);
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
            <h1 className="offer-title">{isEditMode ? "Edit Offer" : "Create Offer"}</h1>
          </div>

          {isEditMode ? (
            <>
              <div className="edit-offer-topbar">
                <h1 className="edit-offer-title">
                  {editOfferId || createdOfferId} - {formData.offerName || "Untitled Offer"}
                </h1>
                <div className="edit-offer-badges">
                  <span className="badge badge-status">● {formData.status || "Approve"}</span>
                  <span className="badge badge-outline">iGaming</span>
                  <button type="button" className="btn edit-offer-options">Options ▾</button>
                </div>
              </div>

              <div className="edit-offer-tabs-wrap" ref={moreMenuRef}>
                <div className="edit-offer-tabs" role="tablist" aria-label="Offer sections">
                  {editOfferTabs.map((tab) => {
                    const isActive = tab.step
                      ? !activePlaceholderTab && activeStep === tab.step
                      : tab.key === "more"
                        ? moreMenuOpen || moreMenuItems.some((item) => item.key === activePlaceholderTab)
                        : activePlaceholderTab === tab.key;

                    if (tab.key === "more") {
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          role="tab"
                          aria-haspopup="menu"
                          aria-expanded={moreMenuOpen}
                          aria-selected={isActive}
                          className={`edit-tab edit-tab-more ${isActive ? "active" : ""}`}
                          onClick={() => selectEditTab(tab)}
                        >
                          <span>{tab.label}</span>
                          <span aria-hidden="true" className="edit-tab-caret">▾</span>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`edit-tab ${isActive ? "active" : ""}`}
                        onClick={() => selectEditTab(tab)}
                      >
                        {React.createElement(tab.icon, { "aria-hidden": true })}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {moreMenuOpen && (
                  <div className="more-menu" role="menu" aria-label="More offer sections">
                    {moreMenuItems.map((item) => (
                      <button
                        type="button"
                        role="menuitem"
                        key={item.key}
                        className={`more-menu-item ${activePlaceholderTab === item.key ? "active" : ""}`}
                        onClick={() => selectMoreMenuItem(item)}
                      >
                        <span className="more-menu-icon" aria-hidden="true">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
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
          )}

          <form onSubmit={handleSubmit}>
            {activePlaceholderTab === "capping" && (
              <div className="offer-form capping-tab">
                <div className="capping-tip">
                  <span aria-hidden="true">📣</span>&nbsp; Automatically stop campaigns when the Advertiser stops them—try <a href="#" className="capping-tip-link" onClick={(event) => event.preventDefault()}>🔗 Linktester</a>.
                </div>

                <div className="capping-rules-list">
                  {cappingRulesLoading && <p className="capping-rules-message">Loading capping rules…</p>}
                  {!cappingRulesLoading && cappingRuleError && <p className="offer-save-error" role="alert">{cappingRuleError}</p>}
                  {!cappingRulesLoading && cappingRules.map((rule) => (
                    <div
                      className="capping-rule-item"
                      key={rule.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => editCappingRule(rule)}
                      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editCappingRule(rule); } }}
                    >
                      <div className="capping-rule-item-main">
                        <span className="capping-rule-handle" aria-hidden="true">☰</span>
                        <div className="capping-rule-item-info">
                          <div className="capping-rule-item-name">{rule.ruleName}</div>
                          <div className="capping-rule-item-offer">#{rule.offerId}</div>
                        </div>
                      </div>
                      <div className="capping-rule-item-actions">
                        <span className="capping-rule-badge capping-rule-badge-type">{rule.ruleType}</span>
                        <span className="capping-rule-badge capping-rule-badge-summary">{rule.cappingValue} {rule.cappingType} @{rule.period}</span>
                        <button type="button" className="capping-rule-edit-btn" onClick={(event) => { event.stopPropagation(); editCappingRule(rule); }}>✎ Edit</button>
                        <button type="button" className="capping-rule-delete-btn" onClick={(event) => { event.stopPropagation(); deleteCappingRule(rule.id); }} aria-label={`Delete ${rule.ruleName}`}>🗑</button>
                      </div>
                    </div>
                  ))}
                  {!cappingRulesLoading && cappingRules.length === 0 && !cappingRuleError && <p className="capping-rules-message">No capping rules yet. Click “+ Create Capping Rule” to add one.</p>}
                </div>

                <div className="capping-rule-panel">
                  <button
                    type="button"
                    className={`capping-rule-toggle ${cappingFormOpen ? "open" : ""}`}
                    aria-expanded={cappingFormOpen}
                    onClick={() => {
                      if (cappingFormOpen) {
                        setCappingFormOpen(false);
                      } else {
                        resetCappingRuleForm();
                        setCappingFormOpen(true);
                      }
                    }}
                  >
                    <span>+ Create Capping Rule</span>
                  </button>

                  {cappingFormOpen && (
                    <div className="capping-rule-form">
                      <div className="capping-rule-row">
                        <div className="capping-field">
                          <label>Rule Name</label>
                          <input type="text" value={cappingRule.ruleName} onChange={(event) => updateCappingRule("ruleName", event.target.value)} />
                        </div>
                      </div>

                      <div className="capping-rule-row">
                        <div className="capping-field">
                          <label>Rule Type</label>
                          <select value={cappingRule.ruleType} onChange={(event) => updateCappingRule("ruleType", event.target.value)}>
                            <option>Advertiser Capping</option>
                            <option>Affiliate Capping</option>
                          </select>
                        </div>
                      </div>

                      <div className="capping-rule-divider" />

                      <div className="capping-rule-row capping-rule-row-3">
                        <div className="capping-field">
                          <label>Capping Type</label>
                          <select value={cappingRule.cappingType} onChange={(event) => updateCappingRule("cappingType", event.target.value)}>
                            <option>Gross Conversions (advertiser)</option>
                            <option>Approved Conversions</option>
                            <option>Gross Revenue (advertiser)</option>
                            <option>Approved Revenue (advertiser)</option>
                            <option>Gross Payout</option>
                            <option>Approved Payout</option>
                            <option>Gross Clicks (advertiser)</option>
                            <option>Approved Clicks</option>
                          </select>
                          {cappingRule.cappingType.includes("Clicks") && (
                            <p className="capping-field-hint">Click Cap only supported in Period : 1 Day</p>
                          )}
                        </div>
                        <div className="capping-field">
                          <label>Period</label>
                          <select value={cappingRule.period} onChange={(event) => updateCappingRule("period", event.target.value)}>
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Total</option>
                          </select>
                        </div>
                        <div className="capping-field">
                          <label>Capping Value</label>
                          <input type="number" min="0" value={cappingRule.cappingValue} onChange={(event) => updateCappingRule("cappingValue", event.target.value)} />
                        </div>
                      </div>

                      <div className="capping-rule-row capping-rule-row-3">
                        <div className="capping-field">
                          <label>Over Capping Action</label>
                          <select value={cappingRule.overCappingAction} onChange={(event) => updateCappingRule("overCappingAction", event.target.value)}>
                            <option>Stop Offer</option>
                            <option>Enable Fallback</option>
                            <option>Enable Fallback + Approve Conversions</option>
                            <option>Approve Conversions</option>
                            <option>Reject Conversions</option>
                            <option>Pending Conversions</option>
                          </select>
                        </div>
                        <div className="capping-field">
                          <label>Capping Timezone</label>
                          <div className="capping-toggle-row">
                            <label className="switch">
                              <input type="checkbox" checked={cappingRule.cappingTimezoneEnabled} onChange={(event) => updateCappingRule("cappingTimezoneEnabled", event.target.checked)} />
                              <span className="slider round" />
                            </label>
                            <span>Enable</span>
                          </div>
                        </div>
                      </div>

                      <div className="capping-rule-divider" />

                      <div className="capping-rule-row">
                        <div className="capping-field">
                          <label>Events</label>
                          <input type="text" value={cappingRule.events} onChange={(event) => updateCappingRule("events", event.target.value)} />
                        </div>
                      </div>

                      <div className="capping-rule-divider" />

                      <div className="capping-rule-row capping-rule-row-4">
                        <div className="capping-field">
                          <label>Affiliate Visibility</label>
                          <select value={cappingRule.affiliateVisibility} onChange={(event) => updateCappingRule("affiliateVisibility", event.target.value)}>
                            <option>Show</option>
                            <option>Hide</option>
                          </select>
                        </div>
                        <div className="capping-field capping-field-inline">
                          <div className="capping-toggle-row">
                            <label className="switch">
                              <input type="checkbox" checked={cappingRule.enableRule} onChange={(event) => updateCappingRule("enableRule", event.target.checked)} />
                              <span className="slider round" />
                            </label>
                            <span>Enable Rule</span>
                          </div>
                        </div>
                        <div className="capping-field">
                          <label>Notification Email</label>
                          <input type="email" placeholder="cc@example.com" value={cappingRule.notificationEmail} onChange={(event) => updateCappingRule("notificationEmail", event.target.value)} />
                        </div>
                        <div className="capping-field">
                          <label>Earlier Notification Threshold</label>
                          <div className="capping-threshold-input">
                            <span>%</span>
                            <input type="text" placeholder="Threshold" value={cappingRule.earlierNotificationThreshold} onChange={(event) => updateCappingRule("earlierNotificationThreshold", event.target.value)} />
                          </div>
                        </div>
                      </div>

                      {cappingRuleError && <p className="offer-save-error" role="alert">{cappingRuleError}</p>}

                      <div className="capping-rule-actions">
                        <button type="button" className="capping-remove" onClick={removeCappingRule} disabled={cappingRuleSaving}>🗑 Remove</button>
                        <button type="button" className="capping-submit" onClick={submitCappingRule} disabled={cappingRuleSaving}>{cappingRuleSaving ? "Saving…" : "⊕ Submit"}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePlaceholderTab === "events" && (
              <div className="offer-form events-payout-tab">
                <div className="events-settings-row">
                  <div className="events-settings-field">
                    <label>Conversion Waiting Time</label>
                    <select value={eventSettings.conversionWaitingTime} onChange={(event) => updateEventSetting("conversionWaitingTime", event.target.value)}>
                      <option>0 Days</option>
                      <option>1 Day</option>
                      <option>3 Days</option>
                      <option>7 Days</option>
                      <option>14 Days</option>
                      <option>30 Days</option>
                      <option>60 Days</option>
                      <option>90 Days</option>
                    </select>
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field">
                    <label>Multi Conversion</label>
                    <select value={eventSettings.multiConversion} onChange={(event) => updateEventSetting("multiConversion", event.target.value)}>
                      <option>Allow Multi Conversions</option>
                      <option>Block Multi Conversions</option>
                    </select>
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field">
                    <label>Conversion Approval</label>
                    <select value={eventSettings.conversionApproval} onChange={(event) => updateEventSetting("conversionApproval", event.target.value)}>
                      <option>Auto</option>
                      <option>Manual</option>
                    </select>
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field">
                    <label>Multi Conversion (IP Based)</label>
                    <select value={eventSettings.multiConversionIp} onChange={(event) => updateEventSetting("multiConversionIp", event.target.value)}>
                      <option>Allow from Same IP</option>
                      <option>Block from Same IP</option>
                    </select>
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field">
                    <label>Display Default Postback Event (Affiliate)</label>
                    <select value={eventSettings.defaultPostbackEvent} onChange={(event) => updateEventSetting("defaultPostbackEvent", event.target.value)}>
                      <option>initial - default</option>
                      <option>approved</option>
                      <option>rejected</option>
                    </select>
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field">
                    <label>Event Mismatch Action</label>
                    <select value={eventSettings.eventMismatchAction} onChange={(event) => updateEventSetting("eventMismatchAction", event.target.value)}>
                      <option>Record Conversion as initial Event</option>
                      <option>Reject Conversion</option>
                      <option>Ignore Conversion</option>
                    </select>
                  </div>
                </div>

                <div className="events-settings-submit-row">
                  {eventSettingsLoading && <span className="events-settings-message" role="status">Loading…</span>}
                  {eventSettingsMessage && <span className="events-settings-message" role="status">{eventSettingsMessage}</span>}
                  <button type="button" className="events-settings-submit" onClick={submitEventSettings} disabled={eventSettingsSaving}>{eventSettingsSaving ? "Saving…" : "⊕ Submit"}</button>
                </div>

                <div className="events-section-divider" />

                <div className="events-section-header">
                  <h2>🚗&nbsp; Payout Rules&nbsp; <a href="#" className="events-video-guide" onClick={(event) => event.preventDefault()}>ⓘ Video Guide</a></h2>
                  <div className="events-section-actions">
                    <button type="button" className="events-dark-btn" onClick={addPayoutRule}>+ Add Rule</button>
                    <button type="button" className="events-dark-btn" onClick={importPayoutRules}>☁ Import Payout Rules ( csv )</button>
                  </div>
                </div>

                {payoutRuleError && <p className="offer-save-error" role="alert">{payoutRuleError}</p>}
                {payoutRulesLoading && <p className="events-empty-message">Loading payout rules…</p>}

                {!payoutRulesLoading && payoutRules.length > 0 && (
                  <div className="capping-rules-list">
                    {payoutRules.map((rule) => (
                      <div
                        className="capping-rule-item"
                        key={rule.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => editPayoutRule(rule)}
                        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editPayoutRule(rule); } }}
                      >
                        <div className="capping-rule-item-main">
                          <span className="capping-rule-handle" aria-hidden="true">☰</span>
                          <div className="capping-rule-item-info">
                            <div className="capping-rule-item-name">{rule.ruleName}</div>
                            <div className="capping-rule-item-offer">Revenue {rule.revenueValue} {rule.revenueModel} · Payout {rule.payoutValue} {rule.payoutModel} {rule.currency}</div>
                          </div>
                        </div>
                        <div className="capping-rule-item-actions">
                          <span className="capping-rule-badge capping-rule-badge-type">Priority {rule.rulePriority}</span>
                          <button type="button" className="capping-rule-edit-btn" onClick={(event) => { event.stopPropagation(); editPayoutRule(rule); }}>✎ Edit</button>
                          <button type="button" className="capping-rule-delete-btn" onClick={(event) => { event.stopPropagation(); deletePayoutRule(rule.id); }} aria-label={`Delete ${rule.ruleName}`}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="capping-rule-panel">
                  <button
                    type="button"
                    className={`capping-rule-toggle ${payoutRuleFormOpen ? "open" : ""}`}
                    aria-expanded={payoutRuleFormOpen}
                    onClick={() => {
                      if (payoutRuleFormOpen) {
                        setPayoutRuleFormOpen(false);
                      } else {
                        resetPayoutRuleForm();
                        setPayoutRuleFormOpen(true);
                      }
                    }}
                  >
                    <span>+ Create Payout Rule</span>
                  </button>

                  {payoutRuleFormOpen && (
                    <div className="capping-rule-form">
                      <div className="capping-rule-row">
                        <div className="capping-field">
                          <label>Rule Name</label>
                          <input type="text" placeholder="Rule name" value={payoutRuleForm.ruleName} onChange={(event) => updatePayoutRuleForm("ruleName", event.target.value)} />
                        </div>
                      </div>

                      <div className="capping-rule-divider" />

                      <div className="payout-rule-pricing-row">
                        <div className="capping-field">
                          <label>Revenue</label>
                          <div className="payout-pricing-inputs">
                            <select value={payoutRuleForm.revenueModel} onChange={(event) => updatePayoutRuleForm("revenueModel", event.target.value)}>
                              <option value="">Select Model</option>
                              <option>CPA</option>
                              <option>CPC</option>
                              <option>CPM</option>
                              <option>RevShare</option>
                            </select>
                            <input type="number" min="0" value={payoutRuleForm.revenueValue} onChange={(event) => updatePayoutRuleForm("revenueValue", event.target.value)} />
                          </div>
                        </div>
                        <div className="capping-field">
                          <label>Payout</label>
                          <div className="payout-pricing-inputs">
                            <select value={payoutRuleForm.payoutModel} onChange={(event) => updatePayoutRuleForm("payoutModel", event.target.value)}>
                              <option value="">Select Model</option>
                              <option>CPA</option>
                              <option>CPC</option>
                              <option>CPM</option>
                              <option>RevShare</option>
                            </select>
                            <input type="number" min="0" value={payoutRuleForm.payoutValue} onChange={(event) => updatePayoutRuleForm("payoutValue", event.target.value)} />
                          </div>
                        </div>
                        <div className="capping-field">
                          <label>Currency</label>
                          <select value={payoutRuleForm.currency} onChange={(event) => updatePayoutRuleForm("currency", event.target.value)} disabled={currenciesLoading}>
                            <option value="">{currenciesLoading ? "Loading..." : "Select Cur..."}</option>
                            {currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code} - {currency.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="capping-rule-divider" />

                      <div className="payout-rule-conditions">
                        {payoutRuleForm.conditions.map((condition, index) => (
                          <div className="payout-rule-condition-row" key={`${condition.type}-${index}`}>
                            <label>{condition.type}</label>
                            <select value={condition.operator} onChange={(event) => updatePayoutRuleCondition(index, "operator", event.target.value)}>
                              <option>is equal</option>
                              <option>is not equal</option>
                            </select>
                            {renderPayoutConditionValue(condition, index)}
                          </div>
                        ))}
                        <button type="button" className="payout-add-more" onClick={addPayoutRuleCondition}>+ Add More</button>
                      </div>

                      <div className="capping-rule-divider" />

                      <div className="payout-rule-footer-row">
                        <div className="capping-field">
                          <label>Affiliate Visibility</label>
                          <select value={payoutRuleForm.affiliateVisibility} onChange={(event) => updatePayoutRuleForm("affiliateVisibility", event.target.value)}>
                            <option>Show</option>
                            <option>Hide</option>
                          </select>
                        </div>
                        <div className="capping-field payout-priority-field">
                          <label>↕ Rule Priority</label>
                          <select value={payoutRuleForm.rulePriority} onChange={(event) => updatePayoutRuleForm("rulePriority", event.target.value)}>
                            <option>10 High</option>
                            <option>5 Medium</option>
                            <option>1 Low</option>
                          </select>
                          <p className="payout-priority-hint">The rule will be checked first if you set Rule Priority Higher as 1. If Rule matched then remaining rules will be ignored.</p>
                        </div>
                      </div>

                      <div className="capping-rule-actions payout-rule-actions">
                        <div className="capping-toggle-row">
                          <label className="switch">
                            <input type="checkbox" checked={payoutRuleForm.enableRule} onChange={(event) => updatePayoutRuleForm("enableRule", event.target.checked)} />
                            <span className="slider round" />
                          </label>
                          <span>Enable Rule</span>
                        </div>
                        <button type="button" className="capping-submit" onClick={submitPayoutRuleForm} disabled={payoutRuleSaving}>{payoutRuleSaving ? "Saving…" : "⊕ Submit"}</button>
                      </div>
                    </div>
                  )}
                </div>

                {!payoutRulesLoading && payoutRules.length === 0 && !payoutRuleFormOpen && (
                  <p className="events-empty-message">No Payout Rule Found</p>
                )}

                <div className="events-section-divider" />

                <div className="events-section-header">
                  <h2>🎧&nbsp; Events / Goals</h2>
                  <div className="events-section-actions">
                    <button type="button" className="events-outline-btn" onClick={createEvent}>+ Create Event</button>
                  </div>
                </div>

                {eventsError && <p className="offer-save-error" role="alert">{eventsError}</p>}
                {eventsLoading && <p className="events-empty-message">Loading events…</p>}
                {!eventsLoading && events.length === 0 && !eventsError && <p className="events-empty-message">No Events Found</p>}

                {!eventsLoading && events.length > 0 && (
                <div className="events-table-wrap">
                  <table className="events-table">
                    <thead>
                      <tr><th>Event</th><th>Token</th><th>Multi Conversion</th><th>Multi Conversion (IP)</th><th>Approval</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {events.map((row) => (
                        <tr key={row.id}>
                          <td>{row.event}</td>
                          <td>{row.token}</td>
                          <td>
                            <select value={row.multiConversion} onChange={(event) => updateEventRow(row.id, "multiConversion", event.target.value)}>
                              <option>Allow</option>
                              <option>Block</option>
                            </select>
                          </td>
                          <td>
                            <select value={row.multiConversionIp} onChange={(event) => updateEventRow(row.id, "multiConversionIp", event.target.value)}>
                              <option>Allow</option>
                              <option>Block</option>
                            </select>
                          </td>
                          <td>
                            <select value={row.approval} onChange={(event) => updateEventRow(row.id, "approval", event.target.value)}>
                              <option>Auto</option>
                              <option>Manual</option>
                            </select>
                          </td>
                          <td className="events-table-action-cell">
                            <button type="button" onClick={() => deleteEvent(row.id)} aria-label={`Delete ${row.event}`}>⋮</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

            {activePlaceholderTab === "fallback" && (
              <div className="offer-form fallback-tab">
                <h2 className="fallback-section-title">Postback</h2>
                <div className="events-settings-row">
                  <div className="events-settings-field">
                    <label>Postback Type</label>
                    <select value={fallbackForm.postbackType} onChange={(event) => updateFallbackForm("postbackType", event.target.value)}>
                      <option value="all">All</option>
                      <option value="s2s">S2S</option>
                      <option value="pixel">Pixel</option>
                      <option value="iframe">Iframe</option>
                    </select>
                  </div>
                </div>

                <div className="events-section-divider" />

                <h2 className="fallback-section-title">Fallback Config</h2>
                <div className="events-settings-row">
                  <div className="events-settings-field">
                    <label>Enable Fallback</label>
                    <select value={fallbackForm.enableFallback} onChange={(event) => updateFallbackForm("enableFallback", event.target.value)}>
                      <option>Disabled</option>
                      <option>Enabled</option>
                    </select>
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>Fallback URL</label>
                    <input
                      type="text"
                      placeholder="Fallback url"
                      value={fallbackForm.fallbackUrl}
                      onChange={(event) => updateFallbackForm("fallbackUrl", event.target.value)}
                      disabled={fallbackForm.enableFallback === "Disabled"}
                    />
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>Fallback Offer</label>
                    <select
                      value={fallbackForm.fallbackOffer}
                      onChange={(event) => updateFallbackForm("fallbackOffer", event.target.value)}
                      disabled={fallbackForm.enableFallback === "Disabled" || offersLoading}
                    >
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field">
                    <label>Fallback Offer Reports - Affiliates</label>
                    <select value={fallbackForm.fallbackOfferReportsAffiliates} onChange={(event) => updateFallbackForm("fallbackOfferReportsAffiliates", event.target.value)}>
                      <option>Disabled</option>
                      <option>Enabled</option>
                    </select>
                  </div>
                </div>

                <div className="events-section-divider" />

                <h2 className="fallback-section-title">Integration</h2>
                <div className="events-settings-row fallback-textarea-row">
                  <div className="events-settings-field fallback-wide-field fallback-textarea-field">
                    <label>HTML/Javascript Code</label>
                    <textarea
                      placeholder="<script src='http://example.com/js-34564355'></script>"
                      value={fallbackForm.htmlJsCode}
                      onChange={(event) => updateFallbackForm("htmlJsCode", event.target.value)}
                    />
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>URL to Replace / Impressions Redirect</label>
                    <input
                      type="text"
                      placeholder="http://example.com/js-34564355"
                      value={fallbackForm.urlToReplace}
                      onChange={(event) => updateFallbackForm("urlToReplace", event.target.value)}
                    />
                  </div>
                </div>

                <div className="events-section-divider" />

                <div className="events-settings-row">
                  <div className="events-settings-field">
                    <label>ERID <small>(For Tracking URL)</small></label>
                    <input type="text" placeholder="Value" value={fallbackForm.erid} onChange={(event) => updateFallbackForm("erid", event.target.value)} />
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field">
                    <label>Force Affiliate Landing Redirect</label>
                    <select value={fallbackForm.forceAffiliateLandingRedirect} onChange={(event) => updateFallbackForm("forceAffiliateLandingRedirect", event.target.value)}>
                      <option value="disable">Disable</option>
                      <option value="dedicated_landing_page">Dedicated Landing Page</option>
                      <option value="dedicated_open_landing_page">Dedicated + Open Landing Page</option>
                    </select>
                  </div>
                </div>

                <div className="events-settings-submit-row">
                  {fallbackLoading && <span className="events-settings-message" role="status">Loading…</span>}
                  {fallbackMessage && <span className="events-settings-message" role="status">{fallbackMessage}</span>}
                  <button type="button" className="events-settings-submit" onClick={submitFallbackForm} disabled={fallbackSaving}>{fallbackSaving ? "Saving…" : "⊕ Submit"}</button>
                  <button type="button" className="events-settings-submit" onClick={submitAndNextFallback} disabled={fallbackSaving}>⊕ Submit &amp; Next Set Event/Payout Tier</button>
                </div>
              </div>
            )}

            {activePlaceholderTab === "antifraud" && (
              <div className="offer-form antifraud-tab">
                <h2 className="fallback-section-title">Fraud Detection</h2>

                <div className="antifraud-field-row">
                  <label><span aria-hidden="true">🛡</span> Click Spamming Defender</label>
                  <div className="antifraud-field-control">
                    <select value={antiFraudForm.clickSpammingDefender} onChange={(event) => updateAntiFraudForm("clickSpammingDefender", event.target.value)}>
                      <option value="">Disabled</option>
                      <option value="10">Light</option>
                      <option value="5">Moderate</option>
                      <option value="1">Strict</option>
                    </select>
                    <p className="antifraud-hint">Algorithm can take few seconds ( realtime ) to trigger Firewall , Fallback not supported .</p>
                  </div>
                </div>

                <div className="antifraud-field-row">
                  <label><span aria-hidden="true">👤</span> Unique Click Limit</label>
                  <div className="antifraud-field-control">
                    <select value={antiFraudForm.uniqueClickLimit} onChange={(event) => updateAntiFraudForm("uniqueClickLimit", event.target.value)}>
                      <option value="">Disabled</option>
                      <option value="1">1 Click</option>
                    </select>
                  </div>
                </div>

                <div className="antifraud-field-row">
                  <label><span aria-hidden="true">📦</span> Proxy / Bot Block</label>
                  <div className="antifraud-field-control">
                    <select value={antiFraudForm.proxyBotBlock} onChange={(event) => updateAntiFraudForm("proxyBotBlock", event.target.value)}>
                      <option>Disabled</option>
                      <option>Enabled</option>
                    </select>
                  </div>
                </div>

                <div className="antifraud-field-row">
                  <label><span aria-hidden="true">🖥</span> Browser Blank Referral</label>
                  <div className="antifraud-field-control">
                    <select value={antiFraudForm.browserBlankReferral} onChange={(event) => updateAntiFraudForm("browserBlankReferral", event.target.value)}>
                      <option>Allow</option>
                      <option>Block</option>
                    </select>
                  </div>
                </div>

                <div className="antifraud-field-row">
                  <div />
                  <div className="antifraud-field-control">
                    <button type="button" className="antifraud-tool-link-btn" onClick={(event) => event.preventDefault()}>⧉ More Anti Fraud Tools</button>
                  </div>
                </div>

                <div className="events-section-divider" />

                <div className="antifraud-field-row antifraud-ip-source-row">
                  <label><span aria-hidden="true">🔑</span> Default IP Source</label>
                  <div className="antifraud-field-control antifraud-ip-source-value">
                    <span>{antiFraudForm.defaultIpSource}</span>
                    <a href="#" onClick={(event) => event.preventDefault()}>Change</a>
                  </div>
                </div>

                <div className="events-section-divider" />

                <h2 className="fallback-section-title"><span aria-hidden="true">👥</span> Click Block Filters <small>(status:block)</small></h2>
                {clickBlockFilterKeys.map((key) => (
                  <div className="antifraud-field-row" key={key}>
                    <label className="antifraud-filter-label">{key}</label>
                    <div className="antifraud-field-control">
                      <input
                        type="text"
                        placeholder="11111, 22222, 33333, 44444"
                        value={clickBlockFilters[key]}
                        onChange={(event) => updateClickBlockFilter(key, event.target.value)}
                      />
                      {key === "ip" && <p className="antifraud-hint">Maximum 500 values allowed.</p>}
                    </div>
                  </div>
                ))}

                <div className="events-section-divider" />

                <h2 className="fallback-section-title"><span aria-hidden="true">🛡</span> Conversion Validate Filters <small>(status:pending)</small></h2>
                {conversionValidateFilterKeys.map((key) => (
                  <div className="conversion-validate-row" key={key}>
                    <label className="antifraud-filter-label">{key}</label>
                    <input
                      type="text"
                      placeholder="value1, value2, value3"
                      value={conversionValidateFilters[key].value}
                      onChange={(event) => updateConversionValidateFilter(key, "value", event.target.value)}
                    />
                    <label className="conversion-validate-radio">
                      <input
                        type="radio"
                        name={`filter-mode-${key}`}
                        checked={conversionValidateFilters[key].mode === "filter"}
                        onChange={() => updateConversionValidateFilter(key, "mode", "filter")}
                      />
                      Filter If no value detected
                    </label>
                    <label className="conversion-validate-radio">
                      <input
                        type="radio"
                        name={`filter-mode-${key}`}
                        checked={conversionValidateFilters[key].mode === "reset"}
                        onChange={() => updateConversionValidateFilter(key, "mode", "reset")}
                      />
                      reset
                    </label>
                  </div>
                ))}

                <div className="events-section-divider" />

                <div className="antifraud-field-row">
                  <label>Click IPv4 Range Filter</label>
                  <div className="antifraud-field-control antifraud-ipv4-control">
                    <select value={antiFraudForm.clickIpv4RangeFilter} onChange={(event) => updateAntiFraudForm("clickIpv4RangeFilter", event.target.value)}>
                      <option>Allow</option>
                      <option>Block</option>
                    </select>
                    <textarea
                      placeholder="1.1.1.1 - 1.1.1.2, 2.1.1.1/24, 1.1.1.*"
                      value={antiFraudForm.clickIpv4RangeValues}
                      onChange={(event) => updateAntiFraudForm("clickIpv4RangeValues", event.target.value)}
                    />
                  </div>
                </div>

                <div className="events-section-divider" />

                <div className="ctit-rule-box">
                  <h2 className="fallback-section-title">Conversions CTIT - Rule</h2>
                  {ctitRules.map((rule) => (
                    <div className="ctit-rule-row" key={rule.id}>
                      <select value={rule.from} onChange={(event) => updateCtitRule(rule.id, "from", event.target.value)}>
                        <option>Click</option>
                        <option>Impression</option>
                      </select>
                      <span>To</span>
                      <div className="ctit-rule-to">
                        {rule.to.map((value) => (
                          <span className="ctit-chip" key={value}>
                            {value}
                            <button type="button" onClick={() => removeCtitRuleTo(rule.id, value)} aria-label={`Remove ${value}`}>×</button>
                          </span>
                        ))}
                        <select value="" onChange={(event) => addCtitRuleTo(rule.id, event.target.value)} aria-label="Add event">
                          <option value="">+ Add</option>
                          <option value="All">All</option>
                          {events.map((row) => <option key={row.id} value={row.event}>{row.event}</option>)}
                        </select>
                      </div>
                      <label className="ctit-inline-label">Min Seconds<input type="number" min="0" value={rule.minSeconds} onChange={(event) => updateCtitRule(rule.id, "minSeconds", event.target.value)} /></label>
                      <span>Between</span>
                      <label className="ctit-inline-label">Max Seconds<input type="number" min="0" value={rule.maxSeconds} onChange={(event) => updateCtitRule(rule.id, "maxSeconds", event.target.value)} /></label>
                      <span>Then</span>
                      <select value={rule.then} onChange={(event) => updateCtitRule(rule.id, "then", event.target.value)}>
                        <option>Accept Conversion</option>
                        <option>Reject Conversion</option>
                        <option>Pending Conversion</option>
                      </select>
                    </div>
                  ))}
                  <button type="button" className="payout-add-more" onClick={addCtitRule}>+ Add More</button>
                </div>

                <div className="events-section-divider" />

                <div className="antifraud-field-row">
                  <label className="antifraud-redirect-label">HTML Redirect / HTTP Referral</label>
                  <div className="antifraud-field-control">
                    <select value={antiFraudForm.htmlRedirectHttpReferral} onChange={(event) => updateAntiFraudForm("htmlRedirectHttpReferral", event.target.value)}>
                      <option value="">Allow Referral - 302 Redirect</option>
                      <option value="2">Allow Referral - 302 Redirect - (Override Global Settings)</option>
                      <option value="3">Hide Referral - 200 Redirect</option>
                      <option value="4">Hide Referral - 302 Redirect</option>
                      <option value="1">Hide Affiliate Referral - 200 Redirect</option>
                    </select>
                  </div>
                </div>

                <div className="events-settings-submit-row">
                  {antiFraudMessage && <span className="events-settings-message" role="status">{antiFraudMessage}</span>}
                  <button type="button" className="events-settings-submit" onClick={submitAntiFraudForm} disabled={antiFraudSaving}>{antiFraudSaving ? "Saving…" : "⊕ Submit"}</button>
                </div>
              </div>
            )}

            {activePlaceholderTab === "automation" && automationView === "list" && (
              <div className="offer-form automation-tab">
                <div className="events-section-header">
                  <h2><span aria-hidden="true">⚡</span> Automation</h2>
                  <div className="events-section-actions">
                    <button type="button" className="events-dark-btn" onClick={openCreateAutomation}>+ Create Automation</button>
                  </div>
                </div>

                <div className="events-table-wrap">
                  <table className="events-table automation-table">
                    <thead>
                      <tr><th>Rule</th><th>Block Level</th><th>Field</th><th>Status</th><th>Last Check</th><th>Alarm</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {automationRulesLoading && (
                        <tr><td colSpan="7" className="automation-empty-cell">Loading automation rules…</td></tr>
                      )}
                      {!automationRulesLoading && automationRuleError && (
                        <tr><td colSpan="7" className="automation-empty-cell offer-save-error">{automationRuleError}</td></tr>
                      )}
                      {!automationRulesLoading && !automationRuleError && automationRules.length === 0 && (
                        <tr><td colSpan="7" className="automation-empty-cell">No data available in table</td></tr>
                      )}
                      {!automationRulesLoading && automationRules.map((rule) => (
                        <tr key={rule.id}>
                          <td>
                            <div className="automation-rule-name-cell">
                              <span className={`automation-rule-dot ${rule.status === "Active" ? "active" : "stopped"}`} aria-hidden="true" />
                              <div>
                                <div className="automation-rule-title">#{rule.id} - {rule.ruleName}</div>
                                <div className="automation-rule-subtitle">{rule.summary}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="capping-rule-badge capping-rule-badge-type">{rule.blockLevel}</span></td>
                          <td>{rule.field}</td>
                          <td><span className={`automation-status-pill ${rule.status === "Active" ? "active" : "stopped"}`}>{rule.status === "Active" ? "✓" : "⊘"} {rule.status}</span></td>
                          <td>
                            <div>{rule.lastCheck}</div>
                            <div className="automation-rule-subtitle">{rule.lastCheckRelative}</div>
                          </td>
                          <td>{rule.alarm}</td>
                          <td className="events-table-action-cell">
                            <button type="button" title="View details">▤</button>
                            <button type="button" title="Edit" onClick={() => editAutomationRule(rule)}>✎</button>
                            <button type="button" title="Delete" className="automation-delete-btn" onClick={() => deleteAutomationRule(rule.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="automation-smart-offer-note">*Offer Automation currently not supported with Smart Offer.</p>
              </div>
            )}

            {activePlaceholderTab === "automation" && automationView === "form" && (
              <div className="offer-form automation-tab">
                <div className="automation-header-bar">
                  <h2><span aria-hidden="true">⚡</span> Automation <span className="automation-id">#{editingAutomationRuleId || (automationRules.length + 1)}</span></h2>
                  <div className="events-section-actions">
                    <button type="button" className="events-dark-btn" onClick={openCreateAutomation}>+ Create Automation</button>
                    <button type="button" className="events-dark-btn" onClick={() => setAutomationView("list")}>☰ Rules</button>
                  </div>
                </div>

                <div className="automation-summary-badges">
                  <span className="capping-rule-badge capping-rule-badge-type">🎚 {automationForm.blockLevel}</span>
                  <span className="capping-rule-badge capping-rule-badge-type">≠ {automationForm.field}</span>
                  <span className="capping-rule-badge capping-rule-badge-type">⏱ {automationForm.schedule}</span>
                  <span className={`automation-status-pill ${automationForm.status === "Active" ? "active" : "stopped"}`}>{automationForm.status === "Active" ? "✓" : "⊘"} {automationForm.status}</span>
                </div>

                <div className="automation-body">
                  <aside className="automation-sidebar">
                    <h3><span aria-hidden="true">☰</span> Rule Sections</h3>
                    <ul>
                      <li onClick={() => scrollToAutomationSection("automation-section-setup")}><span className="automation-section-number">1</span><div>Setup<small>Name, Status</small></div></li>
                      <li onClick={() => scrollToAutomationSection("automation-section-scope")}><span className="automation-section-number">2</span><div>Scope<small>Advertiser, Offers</small></div></li>
                      <li onClick={() => scrollToAutomationSection("automation-section-trigger")}><span className="automation-section-number">3</span><div>Trigger<small>Threshold, Compare</small></div></li>
                      <li onClick={() => scrollToAutomationSection("automation-section-schedule")}><span className="automation-section-number">4</span><div>Schedule<small>Report Status</small></div></li>
                      <li onClick={() => scrollToAutomationSection("automation-section-recovery")}><span className="automation-section-number">5</span><div>Recovery<small>Whitelist, Alert</small></div></li>
                    </ul>
                  </aside>

                  <div className="automation-sections">
                    <section id="automation-section-setup" className="automation-card">
                      <h4><span aria-hidden="true">☰</span> Setup <small>Rule / Status / Block Level</small></h4>
                      <div className="automation-setup-row">
                        <div className="capping-field">
                          <label><span aria-hidden="true">👤</span> Rule Name</label>
                          <input type="text" placeholder="Rule Name" value={automationForm.ruleName} onChange={(event) => updateAutomationForm("ruleName", event.target.value)} />
                        </div>
                        <div className="capping-field">
                          <label><span aria-hidden="true">⏱</span> Status</label>
                          <div className="automation-toggle-buttons">
                            <button type="button" className={`automation-toggle-btn ${automationForm.status === "Active" ? "active" : ""}`} onClick={() => updateAutomationForm("status", "Active")}>◉ Active<small>Running</small></button>
                            <button type="button" className={`automation-toggle-btn ${automationForm.status === "Stopped" ? "active" : ""}`} onClick={() => updateAutomationForm("status", "Stopped")}>⊘ Stopped<small>Paused</small></button>
                          </div>
                        </div>
                      </div>

                      <div className="capping-field">
                        <label><span aria-hidden="true">🎚</span> Block Level</label>
                        <div className="automation-block-level-options">
                          {["Offer Level", "Affiliate Level", "Sub Source Level"].map((level) => (
                            <button
                              type="button"
                              key={level}
                              className={`automation-block-level-card ${automationForm.blockLevel === level ? "active" : ""}`}
                              onClick={() => updateAutomationForm("blockLevel", level)}
                            >
                              <span aria-hidden="true">{level === "Offer Level" ? "🎚" : level === "Affiliate Level" ? "👤" : "🔀"}</span>
                              {level}
                              <small>{level.replace(" Level", "")}</small>
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section id="automation-section-scope" className="automation-card">
                      <h4><span aria-hidden="true">▽</span> Scope <small>Advertiser / Offers / Affiliates</small></h4>
                      <div className="automation-scope-row">
                        <div className="capping-field">
                          <label><span aria-hidden="true">👤</span> Advertiser</label>
                          <input type="text" value={automationForm.advertiser} readOnly />
                        </div>
                        <div className="capping-field">
                          <label><span aria-hidden="true">◱</span> Offers</label>
                          <div className="automation-chip-row">
                            {automationForm.offers.map((offer) => (
                              <span className="ctit-chip" key={offer.id}>
                                {offer.id} ~ {offer.name}
                                <button type="button" onClick={() => removeAutomationOfferChip(offer.id)} aria-label={`Remove ${offer.name}`}>×</button>
                              </span>
                            ))}
                            {automationForm.offers.length === 0 && <span className="automation-rule-subtitle">No offers selected</span>}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section id="automation-section-trigger" className="automation-card">
                      <h4><span aria-hidden="true">↕</span> Trigger <small>Threshold / Compare</small></h4>
                      <div className="automation-trigger-row-3">
                        <div className="capping-field">
                          <label><span aria-hidden="true">✎</span> Conversion</label>
                          <input type="text" value={automationForm.conversion} onChange={(event) => updateAutomationForm("conversion", event.target.value)} />
                        </div>
                        <div className="capping-field">
                          <label><span aria-hidden="true">▶</span> Clicks</label>
                          <input type="text" value={automationForm.clicks} onChange={(event) => updateAutomationForm("clicks", event.target.value)} />
                        </div>
                        <div className="capping-field">
                          <label><span aria-hidden="true">◉</span> Impressions</label>
                          <input type="text" value={automationForm.impressions} onChange={(event) => updateAutomationForm("impressions", event.target.value)} />
                        </div>
                      </div>

                      <div className="events-section-divider" />

                      <div className="automation-trigger-row-2">
                        <div className="capping-field">
                          <label><span aria-hidden="true">📉</span> Field</label>
                          <select value={automationForm.field} onChange={(event) => updateAutomationForm("field", event.target.value)}>
                            <option>CR</option>
                            <option>CTR</option>
                            <option>EPC</option>
                            <option>CVR</option>
                          </select>
                        </div>
                        <div className="capping-field">
                          <label><span aria-hidden="true">≠</span> Compare Type (Block if)</label>
                          <select value={automationForm.compareType} onChange={(event) => updateAutomationForm("compareType", event.target.value)}>
                            <option>&lt; Minimum Value</option>
                            <option>&gt; Maximum Value</option>
                            <option>Between Min - Max</option>
                          </select>
                        </div>
                      </div>

                      <div className="capping-field">
                        <label><span aria-hidden="true">📏</span> Minimum - Maximum Value</label>
                        <div className="automation-minmax-row">
                          <input type="text" value={automationForm.minValue} onChange={(event) => updateAutomationForm("minValue", event.target.value)} />
                          <span>to</span>
                          <input type="text" value={automationForm.maxValue} onChange={(event) => updateAutomationForm("maxValue", event.target.value)} />
                        </div>
                      </div>
                    </section>

                    <section id="automation-section-schedule" className="automation-card">
                      <h4><span aria-hidden="true">📅</span> Filters / Schedule <small>Report Status / Data Look Back / Date Start - End</small></h4>
                      <div className="automation-trigger-row-2">
                        <div className="capping-field">
                          <label><span aria-hidden="true">☰</span> Report Status</label>
                          <select value={automationForm.reportStatus} onChange={(event) => updateAutomationForm("reportStatus", event.target.value)}>
                            <option value="">Select</option>
                            <option>All</option>
                            <option>Approved</option>
                            <option>Pending</option>
                            <option>Rejected</option>
                          </select>
                        </div>
                        <div className="capping-field">
                          <label><span aria-hidden="true">⏳</span> Data Look Back</label>
                          <select value={automationForm.dataLookBack} onChange={(event) => updateAutomationForm("dataLookBack", event.target.value)}>
                            <option>1 Hour</option>
                            <option>6 Hours</option>
                            <option>12 Hours</option>
                            <option>24 Hours</option>
                            <option>7 Days</option>
                          </select>
                        </div>
                      </div>
                      <div className="automation-trigger-row-2">
                        <div className="capping-field">
                          <label><span aria-hidden="true">🗓</span> Schedule</label>
                          <select value={automationForm.schedule} onChange={(event) => updateAutomationForm("schedule", event.target.value)}>
                            <option>5 Mint</option>
                            <option>10 Mint</option>
                            <option>15 Mint</option>
                            <option>30 Mint</option>
                            <option>1 Hour</option>
                          </select>
                        </div>
                        <div className="capping-field">
                          <label><span aria-hidden="true">📆</span> Date Start - End</label>
                          <div className="automation-date-range">
                            <input type="date" value={automationForm.dateStart} onChange={(event) => updateAutomationForm("dateStart", event.target.value)} />
                            <span>to</span>
                            <input type="date" value={automationForm.dateEnd} onChange={(event) => updateAutomationForm("dateEnd", event.target.value)} />
                          </div>
                        </div>
                      </div>
                    </section>

                    <section id="automation-section-recovery" className="automation-card">
                      <h4><span aria-hidden="true">🛡</span> Recovery / Whitelist <small>Resume After / Notification</small></h4>
                      <div className="automation-trigger-row-2">
                        <div className="capping-field">
                          <label><span aria-hidden="true">↻</span> Whitelist Offers</label>
                          <select value={automationForm.whitelistOffers} onChange={(event) => updateAutomationForm("whitelistOffers", event.target.value)} disabled={offersLoading}>
                            <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                            {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                          </select>
                        </div>
                        <div className="capping-field">
                          <label><span aria-hidden="true">↺</span> Resume After</label>
                          <select value={automationForm.resumeAfter} onChange={(event) => updateAutomationForm("resumeAfter", event.target.value)}>
                            <option>1 Hour</option>
                            <option>6 Hours</option>
                            <option>12 Hours</option>
                            <option>24 Hours</option>
                          </select>
                        </div>
                      </div>
                      <div className="automation-trigger-row-2">
                        <div className="capping-field">
                          <label><span aria-hidden="true">🔔</span> Notification</label>
                          <label className="automation-checkbox">
                            <input type="checkbox" checked={automationForm.alertEnabled} onChange={(event) => updateAutomationForm("alertEnabled", event.target.checked)} />
                            Alert
                          </label>
                        </div>
                        <div className="capping-field">
                          <label><span aria-hidden="true">ⓘ</span> Information</label>
                          <div className="automation-info-box">
                            <p>Unique Values Limit : 500</p>
                            <p>Sub Value Length Limit : 50 Character</p>
                            <p>If Sub Values ( Sub Affiliates ) more then 500, then Rule will auto stopped.</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="events-settings-submit-row">
                      <button type="button" className="events-settings-submit" onClick={submitAutomationForm} disabled={automationSaving}>{automationSaving ? "Saving…" : "⊕ Submit"}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePlaceholderTab === "suppression" && suppressionView === "list" && (
              <div className="offer-form suppression-tab">
                <div className="events-section-header">
                  <h2><span aria-hidden="true">📧</span> Suppression List</h2>
                  <div className="events-section-actions">
                    <button type="button" className="events-dark-btn" onClick={openCreateSuppression}>+ Add List</button>
                  </div>
                </div>

                <div className="events-table-wrap">
                  <table className="events-table automation-table">
                    <thead>
                      <tr><th>Name</th><th>OfferID</th><th>File</th><th>Last Updated</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {suppressionListsLoading && (
                        <tr><td colSpan="5" className="automation-empty-cell">Loading suppression lists…</td></tr>
                      )}
                      {!suppressionListsLoading && suppressionListError && (
                        <tr><td colSpan="5" className="automation-empty-cell offer-save-error">{suppressionListError}</td></tr>
                      )}
                      {!suppressionListsLoading && !suppressionListError && suppressionLists.length === 0 && (
                        <tr><td colSpan="5" className="automation-empty-cell">No data available</td></tr>
                      )}
                      {!suppressionListsLoading && suppressionLists.map((row) => (
                        <tr key={row.id}>
                          <td>{row.name}</td>
                          <td>{row.offerId}</td>
                          <td>{row.url || "-"}</td>
                          <td>{row.modifiedOn ? new Date(row.modifiedOn).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : new Date(row.createdOn).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="events-table-action-cell">
                            <button type="button" title="Edit" onClick={() => editSuppressionList(row)}>✎</button>
                            <button type="button" title="Delete" className="automation-delete-btn" onClick={() => deleteSuppressionList(row.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="suppression-pagination">
                  <span>Showing {suppressionLists.length === 0 ? 0 : 1} to {suppressionLists.length} of {suppressionLists.length} entries</span>
                  <div className="suppression-pagination-buttons">
                    <button type="button" disabled>Previous</button>
                    <button type="button" disabled>Next</button>
                  </div>
                </div>
              </div>
            )}

            {activePlaceholderTab === "suppression" && suppressionView === "form" && (
              <div className="offer-form suppression-tab">
                <div className="events-section-header">
                  <h2><span aria-hidden="true">📧</span> {editingSuppressionId ? "Edit Suppression List" : "Create Suppression List"}</h2>
                  <div className="events-section-actions">
                    <button type="button" className="events-dark-btn" onClick={() => setSuppressionView("list")}>☰ Suppression List</button>
                  </div>
                </div>

                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>Name</label>
                    <input type="text" placeholder="Suppression List Name" value={suppressionForm.name} onChange={(event) => updateSuppressionForm("name", event.target.value)} />
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>Offer</label>
                    <select value={suppressionForm.offerId} onChange={(event) => updateSuppressionForm("offerId", event.target.value)} disabled={offersLoading}>
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                  </div>
                </div>

                <div className="events-section-divider" />

                <h2 className="fallback-section-title">Email Opt-out</h2>
                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>Suppression List</label>
                    <select value={suppressionForm.sourceType} onChange={(event) => updateSuppressionForm("sourceType", event.target.value)}>
                      <option>URL</option>
                      <option>File Upload</option>
                    </select>
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>URL</label>
                    <input type="text" placeholder="Suppression File Download URL" value={suppressionForm.url} onChange={(event) => updateSuppressionForm("url", event.target.value)} />
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>Unsubscribe URL</label>
                    <input type="text" placeholder="Unsubscribe URL" value={suppressionForm.unsubscribeUrl} onChange={(event) => updateSuppressionForm("unsubscribeUrl", event.target.value)} />
                  </div>
                </div>

                <div className="events-section-divider" />

                <h2 className="fallback-section-title">Email Instructions</h2>
                <div className="events-settings-row fallback-textarea-row">
                  <div className="events-settings-field fallback-wide-field fallback-textarea-field">
                    <label>Subject Lines</label>
                    <textarea placeholder="Subject lines" value={suppressionForm.subjectLines} onChange={(event) => updateSuppressionForm("subjectLines", event.target.value)} />
                  </div>
                </div>
                <div className="events-settings-row fallback-textarea-row">
                  <div className="events-settings-field fallback-wide-field fallback-textarea-field">
                    <label>From Lines</label>
                    <textarea placeholder="From lines" value={suppressionForm.fromLines} onChange={(event) => updateSuppressionForm("fromLines", event.target.value)} />
                  </div>
                </div>

                <div className="suppression-submit-row">
                  <button type="button" className="events-dark-btn" onClick={submitSuppressionForm} disabled={suppressionSaving}>{suppressionSaving ? "Saving…" : "⊕ Submit"}</button>
                </div>
              </div>
            )}

            {activePlaceholderTab === "retargeting" && retargetingView === "list" && (
              <div className="offer-form suppression-tab">
                <div className="events-section-header">
                  <h2><span aria-hidden="true">{"</>"}</span> Retargeting Tag</h2>
                  <div className="events-section-actions">
                    <button type="button" className="events-dark-btn" onClick={() => { setGlobalRetargetingCopied(false); setShowGlobalRetargetingModal(true); }}>⚡ Global Retargeting Tag</button>
                    <button type="button" className="events-dark-btn" onClick={openCreateRetargeting}>+ Add Retargeting Tag</button>
                  </div>
                </div>

                <div className="events-table-wrap">
                  <table className="events-table automation-table">
                    <thead>
                      <tr><th>ID</th><th>Tag Name</th><th>Affiliate</th><th>Script</th><th>Last Updated</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {retargetingTagsLoading && (
                        <tr><td colSpan="6" className="automation-empty-cell">Loading retargeting tags…</td></tr>
                      )}
                      {!retargetingTagsLoading && retargetingTagError && (
                        <tr><td colSpan="6" className="automation-empty-cell offer-save-error">{retargetingTagError}</td></tr>
                      )}
                      {!retargetingTagsLoading && !retargetingTagError && retargetingTags.length === 0 && (
                        <tr><td colSpan="6" className="automation-empty-cell">No data available</td></tr>
                      )}
                      {!retargetingTagsLoading && retargetingTags.map((row) => {
                        const affiliate = affiliates.find((item) => String(item.id) === String(row.affiliateId));
                        return (
                          <tr key={row.id}>
                            <td>{row.id}</td>
                            <td>{row.tagName}</td>
                            <td>{row.affiliateId == null ? "All (Global)" : (affiliate ? `${row.affiliateId} ~ ${affiliateName(affiliate)}` : row.affiliateId)}</td>
                            <td>{row.code ? `${row.code.slice(0, 40)}${row.code.length > 40 ? "…" : ""}` : "-"}</td>
                            <td>{row.modifiedOn ? new Date(row.modifiedOn).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : new Date(row.createdOn).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                            <td className="events-table-action-cell">
                              <button type="button" title="Edit" onClick={() => editRetargetingTag(row)}>✎</button>
                              <button type="button" title="Delete" className="automation-delete-btn" onClick={() => deleteRetargetingTag(row.id)}>🗑</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activePlaceholderTab === "retargeting" && retargetingView === "form" && (
              <div className="offer-form suppression-tab">
                <div className="events-section-header">
                  <h2><span aria-hidden="true">{"</>"}</span> Retargeting Tags</h2>
                  <div className="events-section-actions">
                    <button type="button" className="events-dark-btn" onClick={() => setRetargetingView("list")}>✕ Close</button>
                  </div>
                </div>

                <h2 className="fallback-section-title">+ Add Retargeting Tag</h2>

                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>Tag Name</label>
                    <input type="text" placeholder="Tag Name" value={retargetingForm.tagName} onChange={(event) => updateRetargetingForm("tagName", event.target.value)} />
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>Affiliate ID</label>
                    <select value={retargetingForm.affiliateId} onChange={(event) => updateRetargetingForm("affiliateId", event.target.value)} disabled={affiliatesLoading}>
                      <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                      {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>URL</label>
                    <input type="text" placeholder="URL" value={retargetingForm.url} onChange={(event) => updateRetargetingForm("url", event.target.value)} />
                  </div>
                </div>
                <div className="events-settings-row fallback-textarea-row">
                  <div className="events-settings-field fallback-wide-field fallback-textarea-field">
                    <label>Code</label>
                    <div>
                      <textarea placeholder="Code" value={retargetingForm.code} onChange={(event) => updateRetargetingForm("code", event.target.value)} style={{ height: "150px" }} />
                      <p className="antifraud-hint">(Only &lt;script&gt; tags are accepted)</p>
                    </div>
                  </div>
                </div>

                <div className="events-settings-submit-row">
                  <button type="button" className="events-settings-submit" onClick={submitRetargetingForm} disabled={retargetingSaving}>{retargetingSaving ? "Saving…" : "⊕ Submit"}</button>
                </div>
              </div>
            )}

            {activePlaceholderTab === "others" && othersView === "grid" && (
              <div className="offer-form others-tab">
                <div className="others-grid">
                  {othersCards.map((card) => (
                    <div className="others-card" key={card.key}>
                      <span className="others-card-icon" style={{ color: card.color }} aria-hidden="true">{card.icon}</span>
                      <h3>{card.title}</h3>
                      <p>{card.category}</p>
                      <div className="others-card-buttons">
                        {card.buttons.map((button) => (
                          <button
                            type="button"
                            key={button.label}
                            className="others-card-btn"
                            onClick={() => handleOthersCardButton(button)}
                          >
                            <span aria-hidden="true">{button.icon}</span> {button.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePlaceholderTab === "others" && othersView === "postback-logs" && (
              <div className="offer-form postback-logs-tab">
                <div className="postback-logs-header">
                  <h2><span aria-hidden="true">👤</span> Advertiser Postback Logs</h2>
                  <div className="postback-logs-filters">
                    <div className="postback-logs-offer-chip">
                      {postbackLogsOfferId && (
                        <span className="ctit-chip">
                          {postbackLogsOfferId}
                          <button type="button" onClick={() => setPostbackLogsOfferId("")} aria-label="Clear offer">×</button>
                        </span>
                      )}
                      {!postbackLogsOfferId && (
                        <select value="" onChange={(event) => setPostbackLogsOfferId(event.target.value)} disabled={offersLoading}>
                          <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                          {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="postback-logs-date-range">
                      <input type="date" value={postbackLogsDateStart} onChange={(event) => setPostbackLogsDateStart(event.target.value)} />
                      <span>-</span>
                      <input type="date" value={postbackLogsDateEnd} onChange={(event) => setPostbackLogsDateEnd(event.target.value)} />
                    </div>
                    <label className="postback-logs-show">
                      Show
                      <input type="number" min="1" value={postbackLogsShowEntries} onChange={(event) => setPostbackLogsShowEntries(event.target.value)} />
                      entries
                    </label>
                    <button type="button" className="events-dark-btn" onClick={() => alert("No data available for the selected filters.")}>Submit</button>
                    <button type="button" className="postback-logs-filter-btn" onClick={() => alert("Additional filters are not connected yet.")} aria-label="More filters">▽</button>
                  </div>
                </div>

                <div className="events-table-wrap">
                  <table className="events-table automation-table">
                    <thead>
                      <tr>
                        {["OfferID", "TID", "PostbackURL", "Postback Payload", "PostbackIP", "ClickTime", "PostbackTime", "Status", "PostbackData"].map((column) => (
                          <th key={column}>{column} <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td colSpan="9" className="automation-empty-cell">No data available in table</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activePlaceholderTab === "others" && othersView === "affiliate-postback-logs" && (
              <div className="offer-form postback-logs-tab">
                <div className="postback-logs-header">
                  <h2><span aria-hidden="true">👥</span> Affiliate Postback Logs</h2>
                  <div className="postback-logs-filters">
                    <label className="postback-logs-test-only">
                      <input type="checkbox" checked={affPostbackLogsTestOnly} onChange={(event) => setAffPostbackLogsTestOnly(event.target.checked)} />
                      TestPostback
                    </label>
                    <div className="postback-logs-offer-affiliate-chip">
                      <div className="postback-logs-offer-chip">
                        {affPostbackLogsOfferId && (
                          <span className="ctit-chip">
                            {(() => {
                              const offer = offers.find((item) => String(item.id) === String(affPostbackLogsOfferId));
                              return offer ? `${offer.id} ~ ${offer.offerName}` : affPostbackLogsOfferId;
                            })()}
                            <button type="button" onClick={() => setAffPostbackLogsOfferId("")} aria-label="Clear offer">×</button>
                          </span>
                        )}
                        {!affPostbackLogsOfferId && (
                          <select value="" onChange={(event) => setAffPostbackLogsOfferId(event.target.value)} disabled={offersLoading}>
                            <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                            {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                          </select>
                        )}
                      </div>
                      <div className="postback-logs-offer-chip">
                        {affPostbackLogsAffiliateId && (
                          <span className="ctit-chip">
                            {(() => {
                              const affiliate = affiliates.find((item) => String(item.id) === String(affPostbackLogsAffiliateId));
                              return affiliate ? affiliateName(affiliate) : affPostbackLogsAffiliateId;
                            })()}
                            <button type="button" onClick={() => setAffPostbackLogsAffiliateId("")} aria-label="Clear affiliate">×</button>
                          </span>
                        )}
                        {!affPostbackLogsAffiliateId && (
                          <select className="postback-logs-affiliate-select" value="" onChange={(event) => setAffPostbackLogsAffiliateId(event.target.value)} disabled={affiliatesLoading}>
                            <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                            {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="postback-logs-date-range">
                      <input type="date" value={affPostbackLogsDateStart} onChange={(event) => setAffPostbackLogsDateStart(event.target.value)} />
                      <span>-</span>
                      <input type="date" value={affPostbackLogsDateEnd} onChange={(event) => setAffPostbackLogsDateEnd(event.target.value)} />
                    </div>
                    <label className="postback-logs-show">
                      Show
                      <input type="number" min="1" value={affPostbackLogsShowEntries} onChange={(event) => setAffPostbackLogsShowEntries(event.target.value)} />
                      entries
                    </label>
                    <button type="button" className="events-dark-btn" onClick={() => alert("No data available for the selected filters.")}><span aria-hidden="true">🕐</span> Submit</button>
                    <button type="button" className="postback-logs-filter-btn" onClick={() => alert("Additional filters are not connected yet.")} aria-label="More filters">▽</button>
                  </div>
                </div>

                <div className="events-table-wrap">
                  <table className="events-table automation-table">
                    <thead>
                      <tr>
                        {["TID", "OfferID", "AffiliateID", "Affiliate", "PostbackURL", "HttpStatus", "PostbackTime", "Status"].map((column) => (
                          <th key={column}>{column} <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td colSpan="8" className="automation-empty-cell">No data available in table</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activePlaceholderTab === "others" && othersView === "reports" && (
              <div className="offer-form reports-tab">
                <div className="reports-header">
                  <h2><span aria-hidden="true">◔</span> Reports</h2>

                  <div className="reports-templates">
                    <span className="reports-templates-label"><span aria-hidden="true">🏷</span> Templates</span>
                    <div className="reports-templates-rows">
                      <div className="reports-templates-row">
                        {reportTemplates.map((template) => (
                          <button
                            type="button"
                            key={template.key}
                            className={`reports-template-tag${reportsActiveTemplate === template.key ? " active" : ""}${template.accent ? " accent" : ""}`}
                            onClick={() => setReportsActiveTemplate(template.key)}
                          >
                            {template.icon && <span aria-hidden="true">{template.icon}</span>} {template.label}
                          </button>
                        ))}
                      </div>
                      <div className="reports-templates-row">
                        {reportTemplatesRow2.map((template) => (
                          <button
                            type="button"
                            key={template.key}
                            className={`reports-template-tag${reportsActiveTemplate === template.key ? " active" : ""}`}
                            onClick={() => setReportsActiveTemplate(template.key)}
                          >
                            {template.icon && <span aria-hidden="true">{template.icon}</span>} {template.label} {template.hasCaret && <span aria-hidden="true">▾</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="reports-period">
                    <span className="reports-period-label"><span aria-hidden="true">📅</span> Period</span>
                    <div className="reports-period-range">
                      <input type="datetime-local" value={reportsPeriodStart} onChange={(event) => setReportsPeriodStart(event.target.value)} />
                      <span>-</span>
                      <input type="datetime-local" value={reportsPeriodEnd} onChange={(event) => setReportsPeriodEnd(event.target.value)} />
                    </div>
                  </div>

                  <div className="reports-results">
                    <span className="reports-results-label"><span aria-hidden="true">☰</span> Results</span>
                    <label className="postback-logs-show">
                      Show
                      <input type="number" min="1" value={reportsShowEntries} onChange={(event) => setReportsShowEntries(event.target.value)} />
                    </label>
                    <button type="button" className="events-dark-btn" onClick={() => alert("No data available for the selected filters.")}><span aria-hidden="true">🕐</span> Submit</button>
                    <button type="button" className="postback-logs-filter-btn" onClick={() => alert("Additional filters are not connected yet.")} aria-label="More filters">▽</button>
                  </div>
                </div>

                <div className="reports-summary">
                  {[
                    { label: "Impressions (MTD)", value: "" },
                    { label: "Clicks (MTD)", value: "1" },
                    { label: "Conversions (MTD)", value: "" },
                    { label: "Revenue (MTD)", value: "USD" },
                    { label: "Payout (MTD)", value: "USD" },
                    { label: "Profit (MTD)", value: "USD" },
                  ].map((metric) => (
                    <div className="reports-summary-item" key={metric.label}>
                      <span className="reports-summary-label">{metric.label}</span>
                      <span className="reports-summary-value">{metric.value}</span>
                    </div>
                  ))}
                </div>

                <div className="reports-ai-row">
                  <button type="button" className="reports-ai-btn" onClick={() => alert("AI Analyze is not connected yet.")}>
                    <span aria-hidden="true">✦</span> AI Analyze
                  </button>
                </div>

                <div className="events-table-wrap">
                  <table className="events-table automation-table reports-table">
                    <thead>
                      <tr>
                        <th rowSpan="2">OfferID <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                        <th rowSpan="2">Affiliate <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                        <th>GrossClicks</th>
                        <th>Conversions</th>
                        <th>AdvertiserPrice</th>
                        <th>AffiliatePayout</th>
                        <th rowSpan="2">Currency</th>
                        <th rowSpan="2">Status</th>
                      </tr>
                      <tr>
                        <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                        <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                        <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                        <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td colSpan="8" className="automation-empty-cell">No data available in table</td></tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td />
                        <td />
                        <td>0</td>
                        <td>0</td>
                        <td>0.00 USD</td>
                        <td>0.00 USD</td>
                        <td />
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="reports-pagination">
                  <button type="button" className="reports-export-btn" onClick={() => alert("Export is not connected yet.")} aria-label="Export">⤓</button>
                  <div className="reports-pagination-pages">
                    <button type="button" aria-label="Previous page">«</button>
                    <button type="button" className="active">1</button>
                    <button type="button" aria-label="Next page">»</button>
                  </div>
                </div>
              </div>
            )}

            {activePlaceholderTab === "others" && othersView === "conversion-logs" && (
              <div className="offer-form postback-logs-tab">
                <div className="postback-logs-header conversion-logs-header">
                  <h2><span aria-hidden="true">📄</span> Conversion Logs</h2>

                  <div className="conversion-logs-summary">
                    <span className="reports-templates-label"><span aria-hidden="true">🏷</span> Summary :</span>
                    <span className="reports-template-tag active">GrossConversions</span>
                  </div>

                  <div className="postback-logs-filters">
                    <div className="postback-logs-offer-chip">
                      <span className="reports-templates-label conversion-logs-offer-label"><span aria-hidden="true">⊕</span> Offer</span>
                      {conversionLogsOfferId && (
                        <span className="ctit-chip">
                          {(() => {
                            const offer = offers.find((item) => String(item.id) === String(conversionLogsOfferId));
                            return offer ? `${offer.id} ~ ${offer.offerName}` : conversionLogsOfferId;
                          })()}
                          <button type="button" onClick={() => setConversionLogsOfferId("")} aria-label="Clear offer">×</button>
                        </span>
                      )}
                      {!conversionLogsOfferId && (
                        <select value="" onChange={(event) => setConversionLogsOfferId(event.target.value)} disabled={offersLoading}>
                          <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                          {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="postback-logs-date-range">
                      <input type="date" value={conversionLogsDateStart} onChange={(event) => setConversionLogsDateStart(event.target.value)} />
                      <span>-</span>
                      <input type="date" value={conversionLogsDateEnd} onChange={(event) => setConversionLogsDateEnd(event.target.value)} />
                    </div>
                    <label className="postback-logs-show">
                      Show
                      <input type="number" min="1" value={conversionLogsShowEntries} onChange={(event) => setConversionLogsShowEntries(event.target.value)} />
                      entries
                    </label>
                    <button type="button" className="events-dark-btn" onClick={() => alert("No data available for the selected filters.")}><span aria-hidden="true">🕐</span> Submit</button>
                    <button type="button" className="postback-logs-filter-btn" onClick={() => alert("Additional filters are not connected yet.")} aria-label="More filters">▽</button>
                  </div>
                </div>

                <div className="conversion-logs-action-row">
                  <button type="button" className="conversion-logs-action-btn" onClick={() => alert("Actions are not connected yet.")}>
                    <span aria-hidden="true">🏷</span> Action <span aria-hidden="true">▾</span>
                  </button>
                </div>

                <div className="events-table-wrap">
                  <table className="events-table automation-table">
                    <thead>
                      <tr>
                        {["Select", "TID", "Total", "Type", "OfferID", "AffiliateID", "Affiliate", "AdvertiserRevenue", "AffiliatePayout", "Event", "ConversionTime", "Status", "Note"].map((column) => (
                          <th key={column}>{column} <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td colSpan="13" className="automation-empty-cell">No data available in table</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activePlaceholderTab === "others" && othersView === "capping-logs" && (
              <div className="offer-form postback-logs-tab">
                <div className="postback-logs-header capping-logs-header">
                  <h2><span aria-hidden="true">📊</span> Capping Logs</h2>
                  <div className="postback-logs-filters">
                    <select value={cappingLogsOfferId} onChange={(event) => setCappingLogsOfferId(event.target.value)} disabled={offersLoading}>
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                    <select value={cappingLogsAffiliateId} onChange={(event) => setCappingLogsAffiliateId(event.target.value)} disabled={affiliatesLoading}>
                      <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                      {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                    </select>
                    <div className="reports-period-range">
                      <input type="datetime-local" value={cappingLogsPeriodStart} onChange={(event) => setCappingLogsPeriodStart(event.target.value)} />
                      <span>-</span>
                      <input type="datetime-local" value={cappingLogsPeriodEnd} onChange={(event) => setCappingLogsPeriodEnd(event.target.value)} />
                    </div>
                    <span className="capping-logs-divider" aria-hidden="true" />
                    <label className="postback-logs-show">
                      Show
                      <input type="number" min="1" value={cappingLogsShowEntries} onChange={(event) => setCappingLogsShowEntries(event.target.value)} />
                    </label>
                    <button type="button" className="events-dark-btn" onClick={() => alert("No data available for the selected filters.")}><span aria-hidden="true">🕐</span> Submit</button>
                  </div>
                </div>

                <div className="events-table-wrap">
                  <table className="events-table automation-table">
                    <thead>
                      <tr>
                        {["Time", "Offer ID", "Affiliate ID", "Event", "Type", "Period", "Capping Value", "Capping Limit", "Start Time - End Time", "Status", "Rule", "Action"].map((column) => (
                          <th key={column}>{column} <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td colSpan="12" className="automation-empty-cell">No data available in table</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activePlaceholderTab === "others" && othersView === "change-logs" && (
              <div className="offer-form postback-logs-tab">
                <div className="postback-logs-header capping-logs-header">
                  <h2><span aria-hidden="true">📊</span> Change Logs</h2>
                  <div className="postback-logs-filters">
                    <select value={changeLogsOfferId} onChange={(event) => setChangeLogsOfferId(event.target.value)} disabled={offersLoading}>
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                    <select value={changeLogsAdvertiserId} onChange={(event) => setChangeLogsAdvertiserId(event.target.value)} disabled={advertisersLoading}>
                      <option value="">{advertisersLoading ? "Loading advertisers…" : "Select Advertiser"}</option>
                      {advertisers.map((advertiser) => <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {advertiserName(advertiser)}</option>)}
                    </select>
                    <select value={changeLogsAffiliateId} onChange={(event) => setChangeLogsAffiliateId(event.target.value)} disabled={affiliatesLoading}>
                      <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                      {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                    </select>
                    <div className="postback-logs-date-range">
                      <input type="date" value={changeLogsDateStart} onChange={(event) => setChangeLogsDateStart(event.target.value)} />
                      <span>-</span>
                      <input type="date" value={changeLogsDateEnd} onChange={(event) => setChangeLogsDateEnd(event.target.value)} />
                    </div>
                    <label className="postback-logs-show">
                      Show
                      <input type="number" min="1" value={changeLogsShowEntries} onChange={(event) => setChangeLogsShowEntries(event.target.value)} />
                    </label>
                    <button type="button" className="events-dark-btn" onClick={() => alert("No data available for the selected filters.")}><span aria-hidden="true">🕐</span> Submit</button>
                  </div>
                </div>

                <div className="events-table-wrap">
                  <table className="events-table automation-table">
                    <thead>
                      <tr>
                        {["Time", "Change Type", "Action Type", "Affected User/Offer", "Action By", "Log Data", "User Info", "URL"].map((column) => (
                          <th key={column}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td colSpan="8" className="automation-empty-cell">No data available in table</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activePlaceholderTab && activePlaceholderTab !== "capping" && activePlaceholderTab !== "events" && activePlaceholderTab !== "fallback" && activePlaceholderTab !== "antifraud" && activePlaceholderTab !== "automation" && activePlaceholderTab !== "suppression" && activePlaceholderTab !== "retargeting" && activePlaceholderTab !== "others" && (
              <div className="offer-form edit-tab-placeholder">
                <div className="edit-tab-placeholder-card">
                  <h2>{editOfferTabs.find((tab) => tab.key === activePlaceholderTab)?.label || moreMenuItems.find((item) => item.key === activePlaceholderTab)?.label}</h2>
                  <p>{editOfferTabPlaceholders[activePlaceholderTab]}</p>
                </div>
              </div>
            )}

            {!activePlaceholderTab && (
              <>
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
                        {!['General', 'Mobile', 'Incentive'].includes(formData.offerType) && <option value={formData.offerType}>{formData.offerType}</option>}
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
                        {!['Public', 'Public + Require Approvel ', 'Private'].includes(formData.offerVisibility) && <option value={formData.offerVisibility}>{formData.offerVisibility}</option>}
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
                        {!['Approve', 'Pending', 'Ended'].includes(formData.status) && <option value={formData.status}>{formData.status}</option>}
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
              </>
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

      {showGlobalRetargetingModal && (
        <div className="modal-overlay" onClick={() => setShowGlobalRetargetingModal(false)}>
          <section className="global-retargeting-modal" onClick={(event) => event.stopPropagation()} aria-label="Global retargeting tag">
            <header className="global-retargeting-header">
              <h2><span aria-hidden="true">{"</>"}</span> Global Retargeting Tag</h2>
              <button type="button" onClick={() => setShowGlobalRetargetingModal(false)} aria-label="Close">×</button>
            </header>
            <div className="global-retargeting-code-box">
              <pre>{GLOBAL_RETARGETING_SCRIPT}</pre>
              <button type="button" className="global-retargeting-copy-btn" onClick={copyGlobalRetargetingScript} aria-label="Copy script" title={globalRetargetingCopied ? "Copied!" : "Copy"}>
                {globalRetargetingCopied ? "✓" : "📋"}
              </button>
            </div>
            <div className="global-retargeting-note">
              <span aria-hidden="true">ⓘ</span> Note : Make sure to include <strong>aff_id={"{aff_id}"}&amp;offer_id={"{offerid}"}</strong> in Offer URL .
            </div>
          </section>
        </div>
      )}

      {showPostbackModal && (
        <div className="modal-overlay" onClick={() => setShowPostbackModal(false)}>
          <section className="postback-modal" onClick={(event) => event.stopPropagation()} aria-label="Postback">
            <header className="postback-header">
              <h2><span aria-hidden="true">🖼</span> Postback</h2>
              <div className="postback-header-actions">
                <button type="button" className="events-dark-btn" onClick={() => alert("Mobile Attribution / Integration is not connected yet.")}>📱 Mobile Attribution / Integration</button>
                <button type="button" className="events-dark-btn" onClick={() => alert("Select Advertiser is not connected yet.")}>👤 Select Advertiser</button>
                <button type="button" className="postback-close" onClick={() => setShowPostbackModal(false)} aria-label="Close">×</button>
              </div>
            </header>

            <div className="capping-field">
              <label>Select Offer</label>
              <select value={postbackOfferId} onChange={(event) => setPostbackOfferId(event.target.value)} disabled={offersLoading}>
                <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
              </select>
            </div>

            <label className="automation-checkbox postback-events-checkbox">
              <input type="checkbox" checked={postbackEventsOnly} onChange={(event) => setPostbackEventsOnly(event.target.checked)} />
              Events Postback:
            </label>

            <div className="capping-field">
              <label>Postback Type</label>
              <div className="postback-type-options">
                {["S2S", "Pixel", "iframe", "Google Tag Manager", "Web SDK", "iGaming"].map((type) => (
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
                {postbackOfferId ? (
                  <>
                    <div className="postback-url-meta">Offer ID - {postbackOfferId}, event - initial</div>
                    <div className="postback-url-divider" />
                    <div className="postback-url-text">{postbackUrl}</div>
                    <button type="button" className="postback-copy-btn" onClick={copyPostbackUrl} title={postbackUrlCopied ? "Copied!" : "Copy"}>{postbackUrlCopied ? "✓" : "📋"}</button>
                  </>
                ) : (
                  <p className="postback-url-empty">Select an offer to generate a postback URL.</p>
                )}
              </div>
            </div>

            <div className="postback-android-row">
              <button type="button" className="events-dark-btn" onClick={() => alert("Android SDK is not connected yet.")}>📱 Android SDK</button>
            </div>

            <div className="postback-ip-note">
              <span aria-hidden="true">ⓘ</span> Avoid unauthenticated Conversions by whitelisting Postback IP . <a href="#" onClick={(event) => event.preventDefault()}>know more</a>
            </div>

            <div className="postback-tokens-grid">
              <label className="postback-token-row postback-token-clickid">
                <input type="checkbox" checked={postbackTokens.ClickID} onChange={() => togglePostbackToken("ClickID")} />
                ClickID
                <select onChange={(event) => event.stopPropagation()}>
                  <option>Select Partner</option>
                </select>
                <span className="postback-token-placeholder">{"{REPLACE}"}</span>
              </label>
              {["AdvSub1", "AdvSub2", "AdvSub3", "AdvSub4", "AdvSub5", "Sale", "Payout", "Currency"].map((token) => (
                <label className="postback-token-row" key={token}>
                  <input type="checkbox" checked={postbackTokens[token]} onChange={() => togglePostbackToken(token)} />
                  {token}
                  <span className="postback-token-placeholder">{"{REPLACE}"}</span>
                </label>
              ))}
            </div>
          </section>
        </div>
      )}

      {showAffiliatePostbackModal && (
        <div className="modal-overlay" onClick={() => setShowAffiliatePostbackModal(false)}>
          <section className="affiliate-postback-modal" onClick={(event) => event.stopPropagation()} aria-label="Affiliate postback">
            <button type="button" className="affiliate-postback-close" onClick={() => setShowAffiliatePostbackModal(false)} aria-label="Close">×</button>
            <header className="affiliate-postback-header">
              <h2><span aria-hidden="true">🖼</span> Affiliate Postback</h2>
              <div className="affiliate-postback-header-actions">
                <button type="button" className="events-dark-btn" onClick={() => openAddPostback("Offer Postback")}>+ Add Offer Postback</button>
                <button type="button" className="events-dark-btn" onClick={() => alert("Import Postback is not connected yet.")}>☁ Import Postback</button>
                <button type="button" className="events-dark-btn" onClick={() => openAddPostback("Global Postback")}>+ Add Global Postback</button>
              </div>
            </header>

            <div className="affiliate-postback-filters">
              <div className="affiliate-postback-offer-chip">
                {affiliatePostbackOfferId ? (
                  <span className="ctit-chip">
                    {affiliatePostbackOfferId}
                    <button type="button" onClick={() => setAffiliatePostbackOfferId("")} aria-label="Clear offer">×</button>
                  </span>
                ) : (
                  <select value="" onChange={(event) => setAffiliatePostbackOfferId(event.target.value)} disabled={offersLoading}>
                    <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                    {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                  </select>
                )}
              </div>
              <select
                className="affiliate-postback-affiliate-select"
                value={affiliatePostbackAffiliateId}
                onChange={(event) => setAffiliatePostbackAffiliateId(event.target.value)}
                disabled={affiliatesLoading}
              >
                <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
              </select>
            </div>

            <div className="events-table-wrap">
              <table className="events-table automation-table">
                <thead>
                  <tr>
                    {["Affiliate ID", "Position", "Offer ID", "Event", "Integration Type", "Type", "Postback URL", "Status", "Trigger", "Action", "Update Time"].map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {affiliatePostbackRows.length === 0 && (
                    <tr><td colSpan="11" className="automation-empty-cell">No data available in table</td></tr>
                  )}
                  {affiliatePostbackRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.affiliateId}</td>
                      <td>{row.position}</td>
                      <td>{row.offerId}</td>
                      <td>{row.event}</td>
                      <td>{row.integrationType}</td>
                      <td>{row.type}</td>
                      <td className="postback-url-cell">{row.url}</td>
                      <td><span className="automation-status-pill active">✓ {row.status}</span></td>
                      <td>{row.trigger}</td>
                      <td className="events-table-action-cell">
                        <button type="button" className="automation-delete-btn" onClick={() => setAffiliatePostbackRows((rows) => rows.filter((item) => item.id !== row.id))}>🗑</button>
                      </td>
                      <td>{row.updateTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {showAddPostbackModal && (
        <div className="modal-overlay" onClick={() => setShowAddPostbackModal(false)}>
          <section className="add-postback-modal" onClick={(event) => event.stopPropagation()} aria-label="Add postback">
            <header className="add-postback-header">
              <h2>+ Add Postback</h2>
              <button type="button" onClick={() => setShowAddPostbackModal(false)} aria-label="Close">×</button>
            </header>

            <div className="events-settings-row">
              <div className="events-settings-field fallback-wide-field">
                <label>Position</label>
                <select value={addPostbackForm.position} onChange={(event) => updateAddPostbackForm("position", event.target.value)}>
                  <option>Offer Postback</option>
                  <option>Global Postback</option>
                </select>
              </div>
            </div>

            {addPostbackForm.position !== "Global Postback" && (
              <div className="events-settings-row">
                <div className="events-settings-field fallback-wide-field">
                  <label>OfferID</label>
                  <select value={addPostbackForm.offerId} onChange={(event) => updateAddPostbackForm("offerId", event.target.value)} disabled={offersLoading}>
                    <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                    {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="events-settings-row">
              <div className="events-settings-field fallback-wide-field">
                <label>Affiliate ID</label>
                <select value={addPostbackForm.affiliateId} onChange={(event) => updateAddPostbackForm("affiliateId", event.target.value)} disabled={affiliatesLoading}>
                  <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                  {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                </select>
              </div>
            </div>

            {addPostbackForm.position !== "Global Postback" && (
              <div className="events-settings-row">
                <div className="events-settings-field fallback-wide-field">
                  <label>Event</label>
                  <select value={addPostbackForm.event} onChange={(event) => updateAddPostbackForm("event", event.target.value)}>
                    <option value="">Select Event</option>
                    {events.map((row) => <option key={row.id} value={row.id}>{row.event}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="events-settings-row">
              <div className="events-settings-field fallback-wide-field">
                <label>Integration Type</label>
                <select value={addPostbackForm.integrationType} onChange={(event) => updateAddPostbackForm("integrationType", event.target.value)}>
                  <option>Default</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>

            <div className="events-settings-row">
              <div className="events-settings-field fallback-wide-field">
                <label>Postback Type</label>
                <select value={addPostbackForm.postbackType} onChange={(event) => updateAddPostbackForm("postbackType", event.target.value)}>
                  <option>S2S</option>
                  <option>Pixel</option>
                  <option>iframe</option>
                  <option>Google Tag Manager</option>
                  <option>Web SDK</option>
                  <option>iGaming</option>
                </select>
              </div>
            </div>

            <div className="events-settings-row fallback-textarea-row">
              <div className="events-settings-field fallback-wide-field fallback-textarea-field">
                <label>Postback URL</label>
                <textarea placeholder="http://example.com/" value={addPostbackForm.url} onChange={(event) => updateAddPostbackForm("url", event.target.value)} style={{ height: "70px" }} />
              </div>
            </div>

            <label className="automation-checkbox add-postback-advance">
              <input type="checkbox" checked={addPostbackForm.advanceSetup} onChange={(event) => updateAddPostbackForm("advanceSetup", event.target.checked)} />
              Advance Setup
            </label>

            <div className="add-postback-submit-row">
              <button type="button" className="events-dark-btn" onClick={submitAddPostback}>+ Add Postback</button>
            </div>

            <div className="events-section-divider" />

            <h2 className="fallback-section-title"><span aria-hidden="true">🏷</span> Postback Tokens</h2>

            <div className="postback-tokens-reference">
              {postbackTokensList.map((item) => (
                <div className="postback-tokens-reference-row" key={item.label}>
                  <label>{item.label}</label>
                  <input type="text" readOnly value={item.token} />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {showAffiliatePostbackTestModal && (
        <div className="modal-overlay" onClick={() => setShowAffiliatePostbackTestModal(false)}>
          <section className="affiliate-postback-test-modal" onClick={(event) => event.stopPropagation()} aria-label="Affiliate postback test">
            <header className="affiliate-postback-test-header">
              <h2><span aria-hidden="true">✂</span> Affiliate Postback Test</h2>
              <div className="affiliate-postback-test-header-actions">
                {affiliatePostbackTestMode === "normal" && (
                  <button type="button" className="events-dark-btn" onClick={() => setAffiliatePostbackTestMode("deep")}>
                    <span aria-hidden="true">🛡</span> Deep Postback Test
                  </button>
                )}
                {affiliatePostbackTestMode === "deep" && (
                  <button type="button" className="events-dark-btn" onClick={() => setAffiliatePostbackTestMode("normal")}>
                    <span aria-hidden="true">🛡</span> Normal Postback Test
                  </button>
                )}
                <button
                  type="button"
                  className="events-dark-btn"
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    setAffPostbackLogsTestOnly(true);
                    setAffPostbackLogsOfferId(deepTestOfferId || String(createdOfferId || editOfferId || ""));
                    setAffPostbackLogsDateStart(today);
                    setAffPostbackLogsDateEnd(today);
                    setShowAffiliatePostbackTestModal(false);
                    setOthersView("affiliate-postback-logs");
                    window.scrollTo(0, 0);
                  }}
                >
                  <span aria-hidden="true">📋</span> Postback Test Logs
                </button>
                <button type="button" onClick={() => setShowAffiliatePostbackTestModal(false)} aria-label="Close">×</button>
              </div>
            </header>

            {affiliatePostbackTestMode === "normal" && (
              <>
                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>Affiliate URL</label>
                    <input
                      type="text"
                      placeholder="http://example.com/.."
                      value={affiliatePostbackTestUrl}
                      onChange={(event) => setAffiliatePostbackTestUrl(event.target.value)}
                    />
                  </div>
                </div>

                <p className="affiliate-postback-test-note">
                  *Make Sure All Target filters are disabled on Affiliate Test link ( GEO , Browser , ISP Targeting etc ).
                </p>

                <p className="affiliate-postback-test-location">Default Test Location : US</p>

                <div className="events-settings-row">
                  <div className="events-settings-field fallback-wide-field">
                    <label>Useragent</label>
                    <select value={affiliatePostbackTestUseragent} onChange={(event) => setAffiliatePostbackTestUseragent(event.target.value)}>
                      {!Object.values(AFFILIATE_TEST_USERAGENTS).includes(affiliatePostbackTestUseragent) && (
                        <option value={affiliatePostbackTestUseragent}>{affiliatePostbackTestUseragent}</option>
                      )}
                      {Object.entries(AFFILIATE_TEST_USERAGENTS).map(([name, ua]) => (
                        <option key={name} value={ua}>{ua}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="affiliate-postback-test-ua-presets">
                  {Object.keys(AFFILIATE_TEST_USERAGENTS).map((name) => (
                    <button
                      type="button"
                      key={name}
                      className="affiliate-postback-test-ua-link"
                      onClick={() => setAffiliatePostbackTestUseragent(AFFILIATE_TEST_USERAGENTS[name])}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="affiliate-postback-test-initiate-btn"
                  onClick={() => {
                    if (!affiliatePostbackTestUrl.trim()) {
                      alert("Please enter an Affiliate URL.");
                      return;
                    }
                    alert("Postback test execution is not connected yet.");
                  }}
                >
                  <span aria-hidden="true">▶</span> Step 1) Initiate Test
                </button>
              </>
            )}

            {affiliatePostbackTestMode === "deep" && (
              <>
                <div className="deep-test-step">
                  <label>Step 1 - Select Offer</label>
                  <select value={deepTestOfferId} onChange={(event) => setDeepTestOfferId(event.target.value)} disabled={offersLoading}>
                    <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                    {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                  </select>
                </div>

                <div className="deep-test-step">
                  <label>Default Click Domain</label>
                  <select value={deepTestClickDomain} onChange={(event) => setDeepTestClickDomain(event.target.value)}>
                    <option value="demo40.o18.click">demo40.o18.click</option>
                  </select>
                </div>

                <div className="deep-test-step deep-test-step-with-action">
                  <div className="deep-test-step-main">
                    <label>Step 2 - 3rd Party Tracking URL</label>
                    <p className="deep-test-step-hint">
                      Paste Affiliate 3rd Party Platform Tracking URL , Click on <strong>Test 1</strong><br />
                      Close Window After all Redirects Completed.
                    </p>
                    <input
                      type="text"
                      placeholder="https://3rdparty.example.com/....."
                      value={deepTestTrackingUrl}
                      onChange={(event) => setDeepTestTrackingUrl(event.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="deep-test-action-link"
                    onClick={() => {
                      if (!deepTestOfferId) {
                        alert("Please select an offer first.");
                        return;
                      }
                      if (!deepTestTrackingUrl.trim()) {
                        alert("Please paste the 3rd party tracking URL first.");
                        return;
                      }
                      alert("Test 1 is not connected yet.");
                    }}
                  >
                    <span aria-hidden="true">✓</span> Test 1
                  </button>
                </div>

                <div className="deep-test-step deep-test-step-with-action">
                  <div className="deep-test-step-main">
                    <label>Step 3 - Fire Test Postback</label>
                    <input type="text" readOnly value={deepTestFirePostbackUrl} placeholder="" />
                  </div>
                  <button
                    type="button"
                    className="deep-test-action-link"
                    onClick={() => alert("Test 2 is not connected yet.")}
                  >
                    <span aria-hidden="true">⟲</span> Test 2
                  </button>
                </div>

                <div className="events-section-divider" />
              </>
            )}
          </section>
        </div>
      )}

      {showLinkTesterModal && (
        <div className="modal-overlay" onClick={() => setShowLinkTesterModal(false)}>
          <section className="link-tester-modal" onClick={(event) => event.stopPropagation()} aria-label="Link tester">
            <div className="link-tester-card">
              <header className="link-tester-header">
                <h2><span aria-hidden="true">👥</span> Link Tester</h2>
                <button type="button" onClick={() => setShowLinkTesterModal(false)} aria-label="Close">×</button>
              </header>

              <div className="events-settings-row">
                <div className="events-settings-field fallback-wide-field">
                  <label>URL</label>
                  <input
                    type="text"
                    value={linkTesterUrl}
                    onChange={(event) => setLinkTesterUrl(event.target.value)}
                  />
                </div>
              </div>

              <div className="events-settings-row">
                <div className="events-settings-field fallback-wide-field">
                  <label>OS / Device</label>
                  <select value={linkTesterOs} onChange={(event) => setLinkTesterOs(event.target.value)}>
                    {LINK_TESTER_OS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>

              <div className="events-settings-row">
                <div className="events-settings-field fallback-wide-field">
                  <label>Country</label>
                  <select value={linkTesterCountry} onChange={(event) => setLinkTesterCountry(event.target.value)} disabled={countriesLoading}>
                    <option value="">{countriesLoading ? "Loading countries..." : "Select Country"}</option>
                    {countryOptions.map((country) => <option key={country} value={country}>{country}</option>)}
                  </select>
                </div>
              </div>

              <div className="link-tester-start-row">
                <button
                  type="button"
                  className="events-dark-btn"
                  onClick={() => {
                    if (!linkTesterUrl.trim()) {
                      alert("Please enter a URL to test.");
                      return;
                    }
                    setLinkTesterResult("Link test execution is not connected yet.");
                  }}
                >
                  Start Test
                </button>
              </div>

              <div className="events-settings-row">
                <div className="events-settings-field fallback-wide-field fallback-textarea-field">
                  <label>Result</label>
                  <textarea readOnly value={linkTesterResult} style={{ height: "170px" }} />
                </div>
              </div>
            </div>

            <div className="link-tester-usage-card">
              <h3>Usage</h3>
              <div className="link-tester-usage-row">
                <span aria-hidden="true">📈</span>
                <span className="link-tester-usage-count">954</span>
                <button type="button" className="events-dark-btn" onClick={() => alert("Buy Units is not connected yet.")}>Buy Units</button>
              </div>
              <p className="link-tester-usage-label">Units Left / 967</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
