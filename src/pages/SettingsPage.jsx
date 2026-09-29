import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/SettingsPage.css";

const NETWORK_SETTINGS_API = "https://localhost:7150/api/NetworkSettings";
const USERS_API = "https://localhost:7228/api/Users";
const AFFILIATES_API = "https://localhost:7029/api/Affiliates";
const ADVERTISERS_API = "https://localhost:7129/api/Advertisers";
const SMTP_SETTINGS_API = "https://localhost:7150/api/SmtpSettings";
const MAILER_LOGS_API = "https://localhost:7150/api/MailerLogs";

const LOGIN_ACCESS_TYPES = ["Employee", "Affiliate", "Advertiser", "Affiliate Employee"];
const TIMEZONE_OPTIONS = [
  "(GMT +0:00) UTC, Western Europe Time, London, Lisbon, Casablanca",
  "(GMT -5:00) Eastern Time, New York, Toronto",
  "(GMT -8:00) Pacific Time, Los Angeles, Vancouver",
  "(GMT +1:00) Central Europe Time, Berlin, Paris, Madrid",
  "(GMT +5:30) India Standard Time, Mumbai, New Delhi",
  "(GMT +8:00) China Standard Time, Beijing, Singapore",
  "(GMT +10:00) Australian Eastern Time, Sydney, Melbourne",
];
const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "AED"];
const LANGUAGE_OPTIONS = ["English (EN)", "Spanish (ES)", "French (FR)", "German (DE)", "Portuguese (PT)"];
const LANDING_PAGE_MISMATCH_OPTIONS = ["Redirect to Offer URL", "Block Click", "Show Error Page"];
const IP_SOURCE_OPTIONS = ["X Forwarded For (server side)", "Remote Address", "CF-Connecting-IP"];
const TRACKING_LINK_TOKEN_OPTIONS = ["aff_click_id", "sub_aff_id", "click_id", "offer_id", "sub1", "sub2", "sub3", "sub4", "sub5"];
const UNIQUE_ID_OPTIONS = ["OfferID", "IP4/6", "DeviceID", "ClickID", "SubID"];
const APPSFLYER_CLICK_SIGNING_MODES = ["Disable Click Signing", "Sign All Clicks", "Sign Selected Advertiser Only"];

const TERMINOLOGY_OPTIONS = {
  affiliate: ["Affiliate", "Publisher", "Partner"],
  offer: ["Offer", "Campaign", "Deal"],
  advertiser: ["Advertiser", "Merchant", "Brand"],
  report: ["Report", "Analytics", "Insights"],
  conversion: ["Conversion", "Sale", "Lead"],
  igamingUser: ["User", "Player", "Member", "Customer"],
};
const FONT_STYLE_OPTIONS = ["Arial", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Inter"];
const CHAT_TICKET_PROVIDERS = ["Tawk.to", "Zendesk", "Intercom", "Crisp", "None"];
const UPLOAD_TARGETS = [
  { key: "favoriteIconDataUrl", label: "Favorite Icon" },
  { key: "logoSmallDataUrl", label: "Logo Small" },
  { key: "adminProfileImageDataUrl", label: "Admin Profile Image" },
];

const AFFILIATE_PLATFORM_THEMES = ["Default", "Dark", "Modern", "Classic"];
const HTTP_REFERRAL_OPTIONS = ["(Offer Default Settings)", "Always Track", "Never Track"];
const PAYMENT_METHOD_OPTIONS = ["Paypal", "Webmoney", "Paxum", "Skrill", "Payoneer", "Bank Wire", "Bitcoin"];
const REPORT_PAYOUT_STATUS_OPTIONS = ["Approved", "Pending", "Rejected", "Hold"];
const SIGNUP_APPROVAL_OPTIONS = ["Pending (after signup)", "Auto Approve", "Manual Review"];
const ADVERTISER_SIGNUP_APPROVAL_OPTIONS = ["Auto Approve (after signup)", "Pending (after signup)", "Manual Review"];

const ADMIN_NOTIFICATION_ROWS = [
  { key: "affiliateSignup", label: "Affiliate Signup", hasInApp: true },
  { key: "advertiserSignup", label: "Advertiser Signup", hasInApp: true },
  { key: "offerRequest", label: "Offer Request", hasInApp: true },
  { key: "affiliatePaymentRequest", label: "Affiliate Payment Request", hasInApp: true },
  { key: "offerCappingThreshold", label: "Offer Capping Threshold/Completed", hasInApp: true },
  { key: "linkTester", label: "Link Tester", hasInApp: false },
  { key: "postbackError", label: "Postback Error", hasInApp: true },
  { key: "login", label: "Login", hasInApp: false },
];
const AFFILIATE_NOTIFICATION_ROWS = [
  { key: "accountSignup", label: "Account Signup", hasInApp: false },
  { key: "accountApprove", label: "Account Approve", hasInApp: false },
  { key: "accountReject", label: "Account Reject", hasInApp: false },
  { key: "offerCappingThreshold", label: "Offer Capping Threshold/Completed", hasInApp: true },
];
const ADVERTISER_NOTIFICATION_ROWS = [
  { key: "accountSignup", label: "Account Signup", hasInApp: false },
  { key: "accountApprove", label: "Account Approve", hasInApp: false },
  { key: "accountReject", label: "Account Reject", hasInApp: false },
];
const NOTIFICATION_GROUPS = [
  { group: "admin", rows: ADMIN_NOTIFICATION_ROWS },
  { group: "affiliate", rows: AFFILIATE_NOTIFICATION_ROWS },
  { group: "advertiser", rows: ADVERTISER_NOTIFICATION_ROWS },
];

const buildDefaultNotificationSettings = () => {
  const settings = {};
  NOTIFICATION_GROUPS.forEach(({ group, rows }) => {
    settings[group] = {};
    rows.forEach((row) => {
      settings[group][row.key] = { email: true, inapp: row.hasInApp ? true : null };
    });
  });
  return settings;
};
const SIGNUP_QUESTION_SLOTS = 10;

const buildEmptySignupQuestions = () =>
  Array.from({ length: SIGNUP_QUESTION_SLOTS }, () => ({ question: "", answers: [] }));

const parseSignupQuestions = (json) => {
  try {
    const parsed = JSON.parse(json || "[]");
    const list = Array.isArray(parsed) ? parsed : [];
    const padded = buildEmptySignupQuestions();
    list.slice(0, SIGNUP_QUESTION_SLOTS).forEach((item, index) => {
      padded[index] = { question: item.question || "", answers: Array.isArray(item.answers) ? item.answers : [] };
    });
    return padded;
  } catch {
    return buildEmptySignupQuestions();
  }
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const buildEmptySmtpForm = () => ({
  id: null,
  host: "",
  fromName: "",
  fromEmail: "",
  username: "",
  password: "",
  port: "465",
  encryptionMode: "SSL",
});

const SETTINGS_TABS = [
  { label: "General", icon: "📄" },
  { label: "Tracking", icon: "📶" },
  { label: "Custom Appearance", icon: "✨" },
  { label: "Affiliate", icon: "👤" },
  { label: "Advertiser", icon: "👤" },
  { label: "SMTP", icon: "✉" },
  { label: "Notifications", icon: "🔔" },
];

const buildEmptyForm = () => ({
  networkName: "",
  loginPlatformDomain: "",
  customLoginPlatformDomain: "",
  loginAccessTypes: ["Employee", "Affiliate", "Advertiser", "Affiliate Employee"],
  timezone: TIMEZONE_OPTIONS[0],
  currency: "USD",
  language: "English (EN)",
  defaultAffiliateManagerUserId: "",
  defaultAdvertiserManagerUserId: "",
  employeeDashboardCustomization: "",
  customPrivacyPolicy: "",
  termsAndConditions: "",
  customTermsAndConditionsTitle: "",
  customTermsAndConditionsBody: "",
  offerDefaultTermsAndConditions: "",

  trackingDomain: "",
  customTrackingDomain: "",
  defaultTrackingProtocol: "HTTPS",
  defaultTrackingDomain: "",
  conversionsOutOfAllowedCountries: "Pending",
  landingPageMismatch: "Redirect to Offer URL",
  globalFallbackUrl: "",
  ipSource: "X Forwarded For (server side)",
  clickIpv4FilterMode: "Allow",
  clickIpv4FilterRanges: "",
  postbackErrorAlertEmail: "",
  postbackErrorThreshold: "10",
  defaultTrackingLinkTokens: ["aff_click_id", "sub_aff_id"],
  trackingLinkPreviewEnabled: false,
  testAffiliateId: "",
  testIps: [],
  defaultUniqueIdFields: ["OfferID", "IP4/6"],
  dataMaskingDeviceId: false,
  dataMaskingIpAddress: false,
  appsFlyerClickSigningMode: "Disable Click Signing",
  appsFlyerAccessKey: "",
  clickSigningAdvertiserId: "",

  favoriteIconDataUrl: "",
  logoSmallDataUrl: "",
  adminProfileImageDataUrl: "",
  invoiceSignatureDataUrl: "",
  terminologyAffiliate: "Affiliate",
  terminologyOffer: "Offer",
  terminologyAdvertiser: "Advertiser",
  terminologyReport: "Report",
  terminologyConversion: "Conversion",
  terminologyIGamingUser: "User",
  fontStyle: "",
  chatTicketProvider: "Tawk.to",
  chatTicketAccessKey1: "",
  chatTicketAccessKey2: "",
  chatTicketAccessKey3: "",

  affiliatePlatformTheme: "Default",
  affiliateDefaultLanguage: "",
  httpReferral: "(Offer Default Settings)",
  referralCommissionEnabled: false,
  referralCommissionType: "Percentage",
  referralCommissionDays: "90",
  referralCommissionValue: "10",
  referralTerms: [],
  affiliatePaymentMethods: [],
  affiliateInvoiceCc: "",
  affiliateReportsDisplay: ["Approved"],
  affiliatePayoutDisplay: ["Approved", "Pending", "Rejected", "Hold"],
  reportFieldsCustomization: [],
  postbackTokenCustomization: [],
  affiliateImpressionUrlEnabled: true,
  affiliateSignUpEnabled: true,
  signUpApproval: "Pending (after signup)",
  signupFieldsCustomization: "",
  signupMessengerTypes: "",
  signupQuestionsEnabled: false,
  signupQuestionsAllowMultiple: false,
  signupQuestions: buildEmptySignupQuestions(),

  advertiserPaymentMethods: [],
  advertiserInvoiceCc: "",
  advertiserSignUpEnabled: false,
  advertiserSignUpApproval: "Auto Approve (after signup)",
  advertiserSignupFieldsCustomization: "",
  advertiserSignupMessengerTypes: "",
  advertiserReportFieldsCustomization: [],

  notificationSettings: buildDefaultNotificationSettings(),
  notificationPrefix: "Production",
  telegramBotToken: "",
  telegramChatId: "",
  slackWebhookUrl: "",
});

const parseNotificationSettings = (json) => {
  const defaults = buildDefaultNotificationSettings();
  try {
    const parsed = JSON.parse(json || "{}");
    NOTIFICATION_GROUPS.forEach(({ group, rows }) => {
      rows.forEach((row) => {
        if (parsed?.[group]?.[row.key]) {
          defaults[group][row.key] = {
            email: Boolean(parsed[group][row.key].email),
            inapp: row.hasInApp ? Boolean(parsed[group][row.key].inapp) : null,
          };
        }
      });
    });
    return defaults;
  } catch {
    return defaults;
  }
};

const RichToolbar = () => (
  <div className="nsp-editor-toolbar">
    {["📁", "↶", "↷", "❝❝", "B", "I", "U", "S", "🔗", "🔗✕", "🖼", "📊", "≡"].map((icon, index) => (
      <button type="button" key={index} onClick={() => {}}>{icon}</button>
    ))}
    <select disabled><option>Styles</option></select>
    <select disabled><option>Format</option></select>
  </div>
);

export default function SettingsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("General");

  const [form, setForm] = useState(buildEmptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [advertisers, setAdvertisers] = useState([]);
  const [testIpInput, setTestIpInput] = useState("");
  const [uploadTargetKey, setUploadTargetKey] = useState(UPLOAD_TARGETS[0].key);
  const [uploadFileName, setUploadFileName] = useState("");
  const [referralTermInput, setReferralTermInput] = useState("");
  const [signupAnswerInputs, setSignupAnswerInputs] = useState({});
  const [smtpForm, setSmtpForm] = useState(buildEmptySmtpForm);
  const [smtpLoading, setSmtpLoading] = useState(true);
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpDebugging, setSmtpDebugging] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [fetchingChats, setFetchingChats] = useState(false);
  const [connectingTelegram, setConnectingTelegram] = useState(false);
  const [connectingSlack, setConnectingSlack] = useState(false);
  const [savingPrefix, setSavingPrefix] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadUsers = async () => {
      try {
        const response = await fetch(USERS_API, { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load users");
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setUsers([]);
      }
    };

    const loadAffiliates = async () => {
      try {
        const response = await fetch(AFFILIATES_API, { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load affiliates");
        const data = await response.json();
        setAffiliates(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setAffiliates([]);
      }
    };

    const loadAdvertisers = async () => {
      try {
        const response = await fetch(ADVERTISERS_API, { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load advertisers");
        const data = await response.json();
        setAdvertisers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setAdvertisers([]);
      }
    };

    const loadSmtpSettings = async () => {
      try {
        setSmtpLoading(true);
        const response = await fetch(`${SMTP_SETTINGS_API}/active`, { headers: { accept: "*/*" }, signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          setSmtpForm({
            id: data.id,
            host: data.host || "",
            fromName: data.fromName || "",
            fromEmail: data.fromEmail || "",
            username: data.username || "",
            password: data.password || "",
            port: String(data.port || 465),
            encryptionMode: data.encryptionMode || (data.useSsl ? "SSL" : "Off"),
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") { /* keep defaults, no SMTP configured yet */ }
      } finally {
        if (!controller.signal.aborted) setSmtpLoading(false);
      }
    };

    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch(NETWORK_SETTINGS_API, { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load settings");
        const data = await response.json();
        setForm({
          networkName: data.networkName || "",
          loginPlatformDomain: data.loginPlatformDomain || "",
          customLoginPlatformDomain: data.customLoginPlatformDomain || "",
          loginAccessTypes: (data.loginAccessTypes || "").split(",").filter(Boolean),
          timezone: data.timezone || TIMEZONE_OPTIONS[0],
          currency: data.currency || "USD",
          language: data.language || "English (EN)",
          defaultAffiliateManagerUserId: data.defaultAffiliateManagerUserId || "",
          defaultAdvertiserManagerUserId: data.defaultAdvertiserManagerUserId || "",
          employeeDashboardCustomization: data.employeeDashboardCustomization || "",
          customPrivacyPolicy: data.customPrivacyPolicy || "",
          termsAndConditions: data.termsAndConditions || "",
          customTermsAndConditionsTitle: data.customTermsAndConditionsTitle || "",
          customTermsAndConditionsBody: data.customTermsAndConditionsBody || "",
          offerDefaultTermsAndConditions: data.offerDefaultTermsAndConditions || "",

          trackingDomain: data.trackingDomain || "",
          customTrackingDomain: data.customTrackingDomain || "",
          defaultTrackingProtocol: data.defaultTrackingProtocol || "HTTPS",
          defaultTrackingDomain: data.defaultTrackingDomain || "",
          conversionsOutOfAllowedCountries: data.conversionsOutOfAllowedCountries || "Pending",
          landingPageMismatch: data.landingPageMismatch || "Redirect to Offer URL",
          globalFallbackUrl: data.globalFallbackUrl || "",
          ipSource: data.ipSource || "X Forwarded For (server side)",
          clickIpv4FilterMode: data.clickIpv4FilterMode || "Allow",
          clickIpv4FilterRanges: data.clickIpv4FilterRanges || "",
          postbackErrorAlertEmail: data.postbackErrorAlertEmail || "",
          postbackErrorThreshold: data.postbackErrorThreshold ?? "10",
          defaultTrackingLinkTokens: (data.defaultTrackingLinkTokens || "aff_click_id,sub_aff_id").split(",").filter(Boolean),
          trackingLinkPreviewEnabled: Boolean(data.trackingLinkPreviewEnabled),
          testAffiliateId: data.testAffiliateId || "",
          testIps: (data.testIps || "").split(",").filter(Boolean),
          defaultUniqueIdFields: (data.defaultUniqueIdFields || "OfferID,IP4/6").split(",").filter(Boolean),
          dataMaskingDeviceId: Boolean(data.dataMaskingDeviceId),
          dataMaskingIpAddress: Boolean(data.dataMaskingIpAddress),
          appsFlyerClickSigningMode: data.appsFlyerClickSigningMode || "Disable Click Signing",
          appsFlyerAccessKey: data.appsFlyerAccessKey || "",
          clickSigningAdvertiserId: data.clickSigningAdvertiserId || "",

          favoriteIconDataUrl: data.favoriteIconDataUrl || "",
          logoSmallDataUrl: data.logoSmallDataUrl || "",
          adminProfileImageDataUrl: data.adminProfileImageDataUrl || "",
          invoiceSignatureDataUrl: data.invoiceSignatureDataUrl || "",
          terminologyAffiliate: data.terminologyAffiliate || "Affiliate",
          terminologyOffer: data.terminologyOffer || "Offer",
          terminologyAdvertiser: data.terminologyAdvertiser || "Advertiser",
          terminologyReport: data.terminologyReport || "Report",
          terminologyConversion: data.terminologyConversion || "Conversion",
          terminologyIGamingUser: data.terminologyIGamingUser || "User",
          fontStyle: data.fontStyle || "",
          chatTicketProvider: data.chatTicketProvider || "Tawk.to",
          chatTicketAccessKey1: data.chatTicketAccessKey1 || "",
          chatTicketAccessKey2: data.chatTicketAccessKey2 || "",
          chatTicketAccessKey3: data.chatTicketAccessKey3 || "",

          affiliatePlatformTheme: data.affiliatePlatformTheme || "Default",
          affiliateDefaultLanguage: data.affiliateDefaultLanguage || "",
          httpReferral: data.httpReferral || "(Offer Default Settings)",
          referralCommissionEnabled: Boolean(data.referralCommissionEnabled),
          referralCommissionType: data.referralCommissionType || "Percentage",
          referralCommissionDays: data.referralCommissionDays ?? "90",
          referralCommissionValue: data.referralCommissionValue || "10",
          referralTerms: (data.referralTerms || "").split(",").filter(Boolean),
          affiliatePaymentMethods: (data.affiliatePaymentMethods || "").split(",").filter(Boolean),
          affiliateInvoiceCc: data.affiliateInvoiceCc || "",
          affiliateReportsDisplay: (data.affiliateReportsDisplay || "Approved").split(",").filter(Boolean),
          affiliatePayoutDisplay: (data.affiliatePayoutDisplay || "Approved,Pending,Rejected,Hold").split(",").filter(Boolean),
          reportFieldsCustomization: (data.reportFieldsCustomization || "").split(",").filter(Boolean),
          postbackTokenCustomization: (data.postbackTokenCustomization || "").split(",").filter(Boolean),
          affiliateImpressionUrlEnabled: data.affiliateImpressionUrlEnabled ?? true,
          affiliateSignUpEnabled: data.affiliateSignUpEnabled ?? true,
          signUpApproval: data.signUpApproval || "Pending (after signup)",
          signupFieldsCustomization: data.signupFieldsCustomization || "",
          signupMessengerTypes: data.signupMessengerTypes || "",
          signupQuestionsEnabled: Boolean(data.signupQuestionsEnabled),
          signupQuestionsAllowMultiple: Boolean(data.signupQuestionsAllowMultiple),
          signupQuestions: parseSignupQuestions(data.signupQuestionsJson),

          advertiserPaymentMethods: (data.advertiserPaymentMethods || "").split(",").filter(Boolean),
          advertiserInvoiceCc: data.advertiserInvoiceCc || "",
          advertiserSignUpEnabled: Boolean(data.advertiserSignUpEnabled),
          advertiserSignUpApproval: data.advertiserSignUpApproval || "Auto Approve (after signup)",
          advertiserSignupFieldsCustomization: data.advertiserSignupFieldsCustomization || "",
          advertiserSignupMessengerTypes: data.advertiserSignupMessengerTypes || "",
          advertiserReportFieldsCustomization: (data.advertiserReportFieldsCustomization || "").split(",").filter(Boolean),

          notificationSettings: parseNotificationSettings(data.notificationSettingsJson),
          notificationPrefix: data.notificationPrefix || "Production",
          telegramBotToken: data.telegramBotToken || "",
          telegramChatId: data.telegramChatId || "",
          slackWebhookUrl: data.slackWebhookUrl || "",
        });
      } catch (error) {
        if (error.name !== "AbortError") { /* keep defaults */ }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadUsers();
    loadAffiliates();
    loadAdvertisers();
    loadSettings();
    loadSmtpSettings();
    return () => controller.abort();
  }, []);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const removeAccessType = (type) => {
    setForm((current) => ({ ...current, loginAccessTypes: current.loginAccessTypes.filter((item) => item !== type) }));
  };

  const addAccessType = (type) => {
    if (!type) return;
    setForm((current) => (current.loginAccessTypes.includes(type) ? current : { ...current, loginAccessTypes: [...current.loginAccessTypes, type] }));
  };

  const toggleListValue = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value],
    }));
  };

  const removeListValue = (field, value) => {
    setForm((current) => ({ ...current, [field]: current[field].filter((item) => item !== value) }));
  };

  const addTestIp = () => {
    const value = testIpInput.trim();
    if (!value) return;
    if (form.testIps.length >= 50) {
      alert("Limit : 50 IP Addresses");
      return;
    }
    setForm((current) => (current.testIps.includes(value) ? current : { ...current, testIps: [...current.testIps, value] }));
    setTestIpInput("");
  };

  const addReferralTerm = () => {
    const value = referralTermInput.trim();
    if (!value) return;
    setForm((current) => (current.referralTerms.includes(value) ? current : { ...current, referralTerms: [...current.referralTerms, value] }));
    setReferralTermInput("");
  };

  const updateSignupQuestion = (index, field, value) => {
    setForm((current) => ({
      ...current,
      signupQuestions: current.signupQuestions.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addSignupAnswer = (index) => {
    const value = (signupAnswerInputs[index] || "").trim();
    if (!value) return;
    setForm((current) => ({
      ...current,
      signupQuestions: current.signupQuestions.map((item, itemIndex) =>
        itemIndex === index && !item.answers.includes(value) ? { ...item, answers: [...item.answers, value] } : item
      ),
    }));
    setSignupAnswerInputs((current) => ({ ...current, [index]: "" }));
  };

  const removeSignupAnswer = (index, answer) => {
    setForm((current) => ({
      ...current,
      signupQuestions: current.signupQuestions.map((item, itemIndex) =>
        itemIndex === index ? { ...item, answers: item.answers.filter((value) => value !== answer) } : item
      ),
    }));
  };

  const selectTab = (tabLabel) => {
    setActiveTab(tabLabel);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const userName = (user) => [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";
  const advertiserName = (advertiser) =>
    [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || "Unnamed Advertiser";

  const handleUploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateForm(uploadTargetKey, dataUrl);
      setUploadFileName(file.name);
    } catch {
      alert("Unable to read the selected file.");
    }
  };

  const handleInvoiceSignatureFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateForm("invoiceSignatureDataUrl", dataUrl);
    } catch {
      alert("Unable to read the selected file.");
    }
  };

  const trackingDomainOptions = [
    ...(form.trackingDomain ? [`${form.trackingDomain}.o18.click`] : []),
    ...form.customTrackingDomain.split(",").map((domain) => domain.trim()).filter(Boolean),
  ];

  const updateSmtpForm = (field, value) => setSmtpForm((current) => ({ ...current, [field]: value }));

  const setupGoogleGmail = () => {
    setSmtpForm((current) => ({
      ...current,
      host: "smtp.gmail.com",
      port: "587",
      encryptionMode: "TLS",
    }));
    alert("Prefilled Gmail SMTP settings. For Gmail you'll need a Google App Password (not your regular password) in the Password field — enable 2-Step Verification on the Google account first, then generate an App Password.");
  };

  const buildSmtpPayload = () => ({
    host: smtpForm.host.trim(),
    port: Number(smtpForm.port) || 465,
    username: smtpForm.username.trim() || null,
    password: smtpForm.password || null,
    fromEmail: smtpForm.fromEmail.trim() || null,
    fromName: smtpForm.fromName.trim() || null,
    useSsl: smtpForm.encryptionMode !== "Off",
    encryptionMode: smtpForm.encryptionMode,
  });

  const submitSmtpForm = async () => {
    if (!smtpForm.host.trim()) {
      alert("Please enter the SMTP host.");
      return;
    }
    try {
      setSmtpSaving(true);
      const response = await fetch(smtpForm.id ? `${SMTP_SETTINGS_API}/${smtpForm.id}` : SMTP_SETTINGS_API, {
        method: smtpForm.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(buildSmtpPayload()),
      });
      if (!response.ok) throw new Error("Unable to save SMTP settings");
      const result = smtpForm.id ? null : await response.json();
      if (result?.id) updateSmtpForm("id", result.id);
      alert("SMTP settings saved.");
    } catch {
      alert("Unable to save SMTP settings. Please check the API and try again.");
    } finally {
      setSmtpSaving(false);
    }
  };

  const debugSmtpConnection = async () => {
    if (!smtpForm.host.trim()) {
      alert("Please enter the SMTP host first.");
      return;
    }
    try {
      setSmtpDebugging(true);
      const response = await fetch(`${SMTP_SETTINGS_API}/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(buildSmtpPayload()),
      });
      const result = await response.json();
      alert(result.success ? `✓ ${result.message}` : `✕ ${result.message}`);
    } catch {
      alert("Unable to reach the SMTP debug endpoint. Please check the API and try again.");
    } finally {
      setSmtpDebugging(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      alert("Please enter an email address to send the test to.");
      return;
    }
    try {
      setSendingTestEmail(true);
      const response = await fetch(`${MAILER_LOGS_API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          recipients: testEmail.trim(),
          subject: "Test Email",
          body: "This is a test email sent from your Offer18 SMTP settings.",
          schedule: "Send Now",
          recipientCount: 1,
        }),
      });
      if (!response.ok) throw new Error("Unable to send test email");
      const result = await response.json();
      alert(`Status: ${result.status}${result.errorMessage ? ` — ${result.errorMessage}` : ""}`);
    } catch {
      alert("Unable to reach the Mailer API. Please check the backend and try again.");
    } finally {
      setSendingTestEmail(false);
    }
  };

  const toggleNotification = (group, key, channel) => {
    setForm((current) => ({
      ...current,
      notificationSettings: {
        ...current.notificationSettings,
        [group]: {
          ...current.notificationSettings[group],
          [key]: {
            ...current.notificationSettings[group][key],
            [channel]: !current.notificationSettings[group][key][channel],
          },
        },
      },
    }));
  };

  const savePrefix = async () => {
    try {
      setSavingPrefix(true);
      const response = await fetch(NETWORK_SETTINGS_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(buildNetworkSettingsPayload()),
      });
      if (!response.ok) throw new Error("Unable to save notification prefix");
      alert("Notification prefix saved.");
    } catch {
      alert("Unable to save the notification prefix. Please check the API and try again.");
    } finally {
      setSavingPrefix(false);
    }
  };

  const fetchTelegramChats = async () => {
    if (!form.telegramBotToken.trim()) {
      alert("Please enter the Telegram bot token first.");
      return;
    }
    try {
      setFetchingChats(true);
      const response = await fetch(`https://api.telegram.org/bot${form.telegramBotToken.trim()}/getUpdates`);
      const data = await response.json();
      if (!data.ok) throw new Error(data.description || "Telegram API error");

      const chats = [];
      (data.result || []).forEach((update) => {
        const chat = update.message?.chat || update.channel_post?.chat;
        if (chat && !chats.some((item) => item.id === chat.id)) {
          chats.push({ id: chat.id, title: chat.title || chat.username || chat.first_name || String(chat.id) });
        }
      });

      if (chats.length === 0) {
        alert("No chats found yet. Send a message to the bot (or add it to the target group/channel) and try again.");
        return;
      }

      updateForm("telegramChatId", String(chats[0].id));
      alert(`Found ${chats.length} chat(s):\n${chats.map((chat) => `${chat.title} — ${chat.id}`).join("\n")}\n\nChat ID field filled with the first result.`);
    } catch (error) {
      alert(`Unable to fetch chats: ${error.message}`);
    } finally {
      setFetchingChats(false);
    }
  };

  const connectTelegram = async () => {
    if (!form.telegramBotToken.trim() || !form.telegramChatId.trim()) {
      alert("Please enter both the bot token and chat ID.");
      return;
    }
    try {
      setConnectingTelegram(true);
      const response = await fetch(`https://api.telegram.org/bot${form.telegramBotToken.trim()}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: form.telegramChatId.trim(), text: `[${form.notificationPrefix || "Production"}] Telegram notifications connected.` }),
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.description || "Telegram API error");
      alert("Connected — a test message was sent to the chat.");
    } catch (error) {
      alert(`Unable to connect: ${error.message}`);
    } finally {
      setConnectingTelegram(false);
    }
  };

  const connectSlack = async () => {
    if (!form.slackWebhookUrl.trim()) {
      alert("Please enter the Slack webhook URL.");
      return;
    }
    try {
      setConnectingSlack(true);
      await fetch(form.slackWebhookUrl.trim(), {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `[${form.notificationPrefix || "Production"}] Slack notifications connected.` }),
      });
      alert("Request sent to the Slack webhook. Browser CORS rules block reading the response, so please check the Slack channel to confirm delivery.");
    } catch (error) {
      alert(`Unable to reach the webhook URL: ${error.message}`);
    } finally {
      setConnectingSlack(false);
    }
  };

  const buildNetworkSettingsPayload = () => {
    return {
        networkName: form.networkName.trim(),
        loginPlatformDomain: form.loginPlatformDomain.trim() || null,
        customLoginPlatformDomain: form.customLoginPlatformDomain.trim() || null,
        loginAccessTypes: form.loginAccessTypes.join(","),
        timezone: form.timezone,
        currency: form.currency,
        language: form.language,
        defaultAffiliateManagerUserId: form.defaultAffiliateManagerUserId ? Number(form.defaultAffiliateManagerUserId) : null,
        defaultAdvertiserManagerUserId: form.defaultAdvertiserManagerUserId ? Number(form.defaultAdvertiserManagerUserId) : null,
        employeeDashboardCustomization: form.employeeDashboardCustomization.trim() || null,
        customPrivacyPolicy: form.customPrivacyPolicy,
        termsAndConditions: form.termsAndConditions,
        customTermsAndConditionsTitle: form.customTermsAndConditionsTitle.trim() || null,
        customTermsAndConditionsBody: form.customTermsAndConditionsBody,
        offerDefaultTermsAndConditions: form.offerDefaultTermsAndConditions,

        trackingDomain: form.trackingDomain.trim() || null,
        customTrackingDomain: form.customTrackingDomain.trim() || null,
        defaultTrackingProtocol: form.defaultTrackingProtocol,
        defaultTrackingDomain: form.defaultTrackingDomain || null,
        conversionsOutOfAllowedCountries: form.conversionsOutOfAllowedCountries,
        landingPageMismatch: form.landingPageMismatch,
        globalFallbackUrl: form.globalFallbackUrl.trim() || null,
        ipSource: form.ipSource,
        clickIpv4FilterMode: form.clickIpv4FilterMode,
        clickIpv4FilterRanges: form.clickIpv4FilterRanges.trim() || null,
        postbackErrorAlertEmail: form.postbackErrorAlertEmail.trim() || null,
        postbackErrorThreshold: form.postbackErrorThreshold ? Number(form.postbackErrorThreshold) : null,
        defaultTrackingLinkTokens: form.defaultTrackingLinkTokens.join(","),
        trackingLinkPreviewEnabled: form.trackingLinkPreviewEnabled,
        testAffiliateId: form.testAffiliateId ? Number(form.testAffiliateId) : null,
        testIps: form.testIps.join(","),
        defaultUniqueIdFields: form.defaultUniqueIdFields.join(","),
        dataMaskingDeviceId: form.dataMaskingDeviceId,
        dataMaskingIpAddress: form.dataMaskingIpAddress,
        appsFlyerClickSigningMode: form.appsFlyerClickSigningMode,
        appsFlyerAccessKey: form.appsFlyerAccessKey || null,
        clickSigningAdvertiserId: form.clickSigningAdvertiserId ? Number(form.clickSigningAdvertiserId) : null,

        favoriteIconDataUrl: form.favoriteIconDataUrl || null,
        logoSmallDataUrl: form.logoSmallDataUrl || null,
        adminProfileImageDataUrl: form.adminProfileImageDataUrl || null,
        invoiceSignatureDataUrl: form.invoiceSignatureDataUrl || null,
        terminologyAffiliate: form.terminologyAffiliate,
        terminologyOffer: form.terminologyOffer,
        terminologyAdvertiser: form.terminologyAdvertiser,
        terminologyReport: form.terminologyReport,
        terminologyConversion: form.terminologyConversion,
        terminologyIGamingUser: form.terminologyIGamingUser,
        fontStyle: form.fontStyle || null,
        chatTicketProvider: form.chatTicketProvider,
        chatTicketAccessKey1: form.chatTicketAccessKey1 || null,
        chatTicketAccessKey2: form.chatTicketAccessKey2 || null,
        chatTicketAccessKey3: form.chatTicketAccessKey3 || null,

        affiliatePlatformTheme: form.affiliatePlatformTheme,
        affiliateDefaultLanguage: form.affiliateDefaultLanguage || null,
        httpReferral: form.httpReferral,
        referralCommissionEnabled: form.referralCommissionEnabled,
        referralCommissionType: form.referralCommissionType,
        referralCommissionDays: form.referralCommissionDays ? Number(form.referralCommissionDays) : null,
        referralCommissionValue: form.referralCommissionValue || null,
        referralTerms: form.referralTerms.join(","),
        affiliatePaymentMethods: form.affiliatePaymentMethods.join(","),
        affiliateInvoiceCc: form.affiliateInvoiceCc.trim() || null,
        affiliateReportsDisplay: form.affiliateReportsDisplay.join(","),
        affiliatePayoutDisplay: form.affiliatePayoutDisplay.join(","),
        reportFieldsCustomization: form.reportFieldsCustomization.join(","),
        postbackTokenCustomization: form.postbackTokenCustomization.join(","),
        affiliateImpressionUrlEnabled: form.affiliateImpressionUrlEnabled,
        affiliateSignUpEnabled: form.affiliateSignUpEnabled,
        signUpApproval: form.signUpApproval,
        signupFieldsCustomization: form.signupFieldsCustomization.trim() || null,
        signupMessengerTypes: form.signupMessengerTypes.trim() || null,
        signupQuestionsEnabled: form.signupQuestionsEnabled,
        signupQuestionsAllowMultiple: form.signupQuestionsAllowMultiple,
        signupQuestionsJson: JSON.stringify(form.signupQuestions.filter((item) => item.question.trim())),

        advertiserPaymentMethods: form.advertiserPaymentMethods.join(","),
        advertiserInvoiceCc: form.advertiserInvoiceCc.trim() || null,
        advertiserSignUpEnabled: form.advertiserSignUpEnabled,
        advertiserSignUpApproval: form.advertiserSignUpApproval,
        advertiserSignupFieldsCustomization: form.advertiserSignupFieldsCustomization.trim() || null,
        advertiserSignupMessengerTypes: form.advertiserSignupMessengerTypes.trim() || null,
        advertiserReportFieldsCustomization: form.advertiserReportFieldsCustomization.join(","),

        notificationSettingsJson: JSON.stringify(form.notificationSettings),
        notificationPrefix: form.notificationPrefix.trim() || null,
        telegramBotToken: form.telegramBotToken.trim() || null,
        telegramChatId: form.telegramChatId.trim() || null,
        slackWebhookUrl: form.slackWebhookUrl.trim() || null,
    };
  };

  const submitForm = async () => {
    if (!form.networkName.trim()) {
      alert("Please enter a network name.");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(NETWORK_SETTINGS_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(buildNetworkSettingsPayload()),
      });
      if (!response.ok) throw new Error("Unable to save settings");
      alert("Settings saved.");
    } catch {
      alert("Unable to save the settings. Please check the API and try again.");
    } finally {
      setSaving(false);
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

        <main className="nsp-page">
          <section className="nsp-card">
            <div className="nsp-header">
              <h1><span aria-hidden="true">⚙</span> Settings</h1>
              <div className="nsp-tabs">
                {SETTINGS_TABS.map((tab) => (
                  <button
                    type="button"
                    key={tab.label}
                    className={`nsp-tab-btn ${activeTab === tab.label ? "active" : ""}`}
                    onClick={() => selectTab(tab.label)}
                  >
                    <span aria-hidden="true">{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="nsp-loading">Loading settings…</p>
            ) : (
              <div className="nsp-content">
                {activeTab === "General" && (
                <div id="nsp-section-general">
                  <div className="nsp-row">
                    <label>Network Name</label>
                    <input value={form.networkName} onChange={(event) => updateForm("networkName", event.target.value)} />
                  </div>

                  <div className="nsp-row">
                    <label>Login Platform Domain</label>
                    <div className="nsp-domain-input">
                      <input value={form.loginPlatformDomain} onChange={(event) => updateForm("loginPlatformDomain", event.target.value)} />
                      <span>.offer18.com</span>
                    </div>
                  </div>

                  <div className="nsp-row">
                    <label>Custom Login Platform Domain</label>
                    <div className="nsp-inline-field">
                      <input value={form.customLoginPlatformDomain} onChange={(event) => updateForm("customLoginPlatformDomain", event.target.value)} />
                      <button type="button" className="nsp-link-btn" onClick={() => alert("Manage Custom Domain SSL is not connected yet.")}>
                        Manage Custom Domain SSL
                      </button>
                    </div>
                  </div>

                  <div className="nsp-row">
                    <label>Login Access Type</label>
                    <div className="nsp-chip-field">
                      {form.loginAccessTypes.map((type) => (
                        <span className="nsp-chip" key={type}>
                          {type}
                          <button type="button" onClick={() => removeAccessType(type)} aria-label={`Remove ${type}`}>×</button>
                        </span>
                      ))}
                      <select value="" onChange={(event) => addAccessType(event.target.value)}>
                        <option value="">+ Add</option>
                        {LOGIN_ACCESS_TYPES.filter((type) => !form.loginAccessTypes.includes(type)).map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="nsp-row">
                    <label>Timezone</label>
                    <select value={form.timezone} onChange={(event) => updateForm("timezone", event.target.value)}>
                      {TIMEZONE_OPTIONS.map((tz) => <option key={tz}>{tz}</option>)}
                    </select>
                  </div>

                  <div className="nsp-row">
                    <label>Currency</label>
                    <select value={form.currency} onChange={(event) => updateForm("currency", event.target.value)}>
                      {CURRENCY_OPTIONS.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </div>

                  <div className="nsp-row">
                    <label>Language</label>
                    <select value={form.language} onChange={(event) => updateForm("language", event.target.value)}>
                      {LANGUAGE_OPTIONS.map((lang) => <option key={lang}>{lang}</option>)}
                    </select>
                  </div>

                  <div className="nsp-row">
                    <label>Default Affiliate Manager</label>
                    <select value={form.defaultAffiliateManagerUserId} onChange={(event) => updateForm("defaultAffiliateManagerUserId", event.target.value)}>
                      <option value="">Select Employee</option>
                      {users.map((user) => <option key={user.id} value={user.id}>{userName(user)}</option>)}
                    </select>
                  </div>

                  <div className="nsp-row">
                    <label>Default Advertiser Manager</label>
                    <select value={form.defaultAdvertiserManagerUserId} onChange={(event) => updateForm("defaultAdvertiserManagerUserId", event.target.value)}>
                      <option value="">Select Employee</option>
                      {users.map((user) => <option key={user.id} value={user.id}>{userName(user)}</option>)}
                    </select>
                  </div>

                  <div className="nsp-row">
                    <label>Employee Dashboard Customization</label>
                    <input value={form.employeeDashboardCustomization} onChange={(event) => updateForm("employeeDashboardCustomization", event.target.value)} />
                  </div>

                  <div className="nsp-row nsp-row-editor">
                    <label>Custom Privacy Policy</label>
                    <div className="nsp-editor">
                      <RichToolbar />
                      <textarea value={form.customPrivacyPolicy} onChange={(event) => updateForm("customPrivacyPolicy", event.target.value)} />
                    </div>
                  </div>

                  <div className="nsp-row nsp-row-editor">
                    <label>Terms &amp; Conditions</label>
                    <div className="nsp-editor">
                      <RichToolbar />
                      <textarea value={form.termsAndConditions} onChange={(event) => updateForm("termsAndConditions", event.target.value)} />
                    </div>
                  </div>

                  <div className="nsp-row nsp-row-editor">
                    <label>Custom Terms &amp; Conditions</label>
                    <div className="nsp-custom-terms">
                      <input
                        placeholder="Marketing Terms"
                        value={form.customTermsAndConditionsTitle}
                        onChange={(event) => updateForm("customTermsAndConditionsTitle", event.target.value)}
                      />
                      <div className="nsp-editor">
                        <RichToolbar />
                        <textarea value={form.customTermsAndConditionsBody} onChange={(event) => updateForm("customTermsAndConditionsBody", event.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="nsp-row nsp-row-editor">
                    <label>Offer Default Terms &amp; Conditions</label>
                    <div className="nsp-editor">
                      <RichToolbar />
                      <textarea value={form.offerDefaultTermsAndConditions} onChange={(event) => updateForm("offerDefaultTermsAndConditions", event.target.value)} />
                    </div>
                  </div>
                </div>
                )}

                {activeTab === "Tracking" && (
                <div id="nsp-section-tracking">
                  <div className="nsp-row">
                    <label>Tracking Domain</label>
                    <div className="nsp-domain-input">
                      <input value={form.trackingDomain} onChange={(event) => updateForm("trackingDomain", event.target.value)} />
                      <span>.o18.click</span>
                    </div>
                  </div>

                  <div className="nsp-row nsp-row-editor">
                    <label>Custom Tracking Domain</label>
                    <div className="nsp-inline-field">
                      <textarea
                        className="nsp-plain-textarea"
                        placeholder="test1.com, test2.com"
                        value={form.customTrackingDomain}
                        onChange={(event) => updateForm("customTrackingDomain", event.target.value)}
                      />
                      <button type="button" className="nsp-link-btn" onClick={() => alert("Manage Custom Domain SSL is not connected yet.")}>
                        Manage Custom Domain SSL
                      </button>
                    </div>
                  </div>

                  <div className="nsp-row">
                    <label>Default Tracking Domain</label>
                    <div className="nsp-split-field">
                      <select value={form.defaultTrackingProtocol} onChange={(event) => updateForm("defaultTrackingProtocol", event.target.value)}>
                        <option>HTTPS</option>
                        <option>HTTP</option>
                      </select>
                      <select value={form.defaultTrackingDomain} onChange={(event) => updateForm("defaultTrackingDomain", event.target.value)}>
                        <option value="">Select Domain</option>
                        {trackingDomainOptions.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="nsp-row">
                    <label>Conversions out of Allowed Countries</label>
                    <div className="nsp-radio-row">
                      {["Pending", "Accept", "Reject"].map((option) => (
                        <label className="nsp-radio" key={option}>
                          <input
                            type="radio"
                            name="conversionsOutOfAllowedCountries"
                            checked={form.conversionsOutOfAllowedCountries === option}
                            onChange={() => updateForm("conversionsOutOfAllowedCountries", option)}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="nsp-row">
                    <label>Landing Page Mismatch</label>
                    <select value={form.landingPageMismatch} onChange={(event) => updateForm("landingPageMismatch", event.target.value)}>
                      {LANDING_PAGE_MISMATCH_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </div>

                  <div className="nsp-row">
                    <label>Global Fallback URL</label>
                    <input value={form.globalFallbackUrl} onChange={(event) => updateForm("globalFallbackUrl", event.target.value)} placeholder="https://www.globalfallback.com" />
                  </div>

                  <div className="nsp-row">
                    <label>IP Source</label>
                    <select value={form.ipSource} onChange={(event) => updateForm("ipSource", event.target.value)}>
                      {IP_SOURCE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </div>

                  <div className="nsp-row">
                    <label>Tracking : Click IPv4 Range Filter</label>
                    <div className="nsp-split-field nsp-split-field-wide">
                      <select value={form.clickIpv4FilterMode} onChange={(event) => updateForm("clickIpv4FilterMode", event.target.value)}>
                        <option>Allow</option>
                        <option>Block</option>
                      </select>
                      <textarea
                        className="nsp-plain-textarea"
                        placeholder="1.1.1.1 - 1.1.1.2, 2.1.1.1/24, 1.1.1.*"
                        value={form.clickIpv4FilterRanges}
                        onChange={(event) => updateForm("clickIpv4FilterRanges", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="nsp-row">
                    <label>Postback Error Alerts</label>
                    <div className="nsp-postback-alert-field">
                      <input
                        type="email"
                        placeholder="alerts@example.com"
                        value={form.postbackErrorAlertEmail}
                        onChange={(event) => updateForm("postbackErrorAlertEmail", event.target.value)}
                      />
                      <span>Threshold</span>
                      <input
                        type="number"
                        min="0"
                        value={form.postbackErrorThreshold}
                        onChange={(event) => updateForm("postbackErrorThreshold", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="nsp-row">
                    <label>Default Tracking Link Tokens</label>
                    <div className="nsp-chip-field">
                      {form.defaultTrackingLinkTokens.map((token) => (
                        <span className="nsp-chip" key={token}>
                          {token}
                          <button type="button" onClick={() => removeListValue("defaultTrackingLinkTokens", token)} aria-label={`Remove ${token}`}>×</button>
                        </span>
                      ))}
                      <select value="" onChange={(event) => toggleListValue("defaultTrackingLinkTokens", event.target.value)}>
                        <option value="">+ Add</option>
                        {TRACKING_LINK_TOKEN_OPTIONS.filter((token) => !form.defaultTrackingLinkTokens.includes(token)).map((token) => (
                          <option key={token} value={token}>{token}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="nsp-row">
                    <label>Tracking Link Preview</label>
                    <label className="nsp-switch-field">
                      <button
                        type="button"
                        className={`nsp-switch ${form.trackingLinkPreviewEnabled ? "on" : ""}`}
                        onClick={() => updateForm("trackingLinkPreviewEnabled", !form.trackingLinkPreviewEnabled)}
                      >
                        <span />
                      </button>
                      Enable
                    </label>
                  </div>

                  <div className="nsp-row">
                    <label>Test Affiliate</label>
                    <select value={form.testAffiliateId} onChange={(event) => updateForm("testAffiliateId", event.target.value)}>
                      <option value="">Select Affiliate</option>
                      {affiliates.map((affiliate) => (
                        <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="nsp-row nsp-row-editor">
                    <label>Test IP</label>
                    <div className="nsp-test-ip-field">
                      <div className="nsp-chip-field">
                        {form.testIps.map((ip) => (
                          <span className="nsp-chip" key={ip}>
                            {ip}
                            <button type="button" onClick={() => removeListValue("testIps", ip)} aria-label={`Remove ${ip}`}>×</button>
                          </span>
                        ))}
                        <input
                          className="nsp-chip-input"
                          placeholder="1.1.1.1, 2.2.2.2, 3.3.3.3"
                          value={testIpInput}
                          onChange={(event) => setTestIpInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === ",") {
                              event.preventDefault();
                              addTestIp();
                            }
                          }}
                          onBlur={addTestIp}
                        />
                      </div>
                      <small className="nsp-hint">Limit : 50 IP Addresses</small>
                    </div>
                  </div>

                  <div className="nsp-row">
                    <label>Default Unique ID</label>
                    <div className="nsp-chip-field">
                      {form.defaultUniqueIdFields.map((field) => (
                        <span className="nsp-chip" key={field}>
                          {field}
                          <button type="button" onClick={() => removeListValue("defaultUniqueIdFields", field)} aria-label={`Remove ${field}`}>×</button>
                        </span>
                      ))}
                      <select value="" onChange={(event) => toggleListValue("defaultUniqueIdFields", event.target.value)}>
                        <option value="">+ Add</option>
                        {UNIQUE_ID_OPTIONS.filter((field) => !form.defaultUniqueIdFields.includes(field)).map((field) => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="nsp-row">
                    <label>Data Masking GDPR</label>
                    <div className="nsp-data-masking-row">
                      <label className="nsp-switch-field">
                        <button
                          type="button"
                          className={`nsp-switch ${form.dataMaskingDeviceId ? "on" : ""}`}
                          onClick={() => updateForm("dataMaskingDeviceId", !form.dataMaskingDeviceId)}
                        >
                          <span />
                        </button>
                        Device ID
                      </label>
                      <label className="nsp-switch-field">
                        <button
                          type="button"
                          className={`nsp-switch ${form.dataMaskingIpAddress ? "on" : ""}`}
                          onClick={() => updateForm("dataMaskingIpAddress", !form.dataMaskingIpAddress)}
                        >
                          <span />
                        </button>
                        IP Address
                      </label>
                    </div>
                  </div>

                  <div className="nsp-row nsp-row-editor">
                    <label>Click Signing</label>
                    <div className="nsp-click-signing-row">
                      <div className="nsp-click-signing-field">
                        <span>AppsFlyer Click Signing Mode</span>
                        <select value={form.appsFlyerClickSigningMode} onChange={(event) => updateForm("appsFlyerClickSigningMode", event.target.value)}>
                          {APPSFLYER_CLICK_SIGNING_MODES.map((mode) => <option key={mode}>{mode}</option>)}
                        </select>
                      </div>
                      <div className="nsp-click-signing-field">
                        <span>AppsFlyer Access Key</span>
                        <input
                          type="password"
                          value={form.appsFlyerAccessKey}
                          onChange={(event) => updateForm("appsFlyerAccessKey", event.target.value)}
                        />
                      </div>
                      <div className="nsp-click-signing-field">
                        <span>Advertiser</span>
                        <select value={form.clickSigningAdvertiserId} onChange={(event) => updateForm("clickSigningAdvertiserId", event.target.value)}>
                          <option value="">Select Advertiser</option>
                          {advertisers.map((advertiser) => (
                            <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {advertiserName(advertiser)}</option>
                          ))}
                        </select>
                      </div>
                      <button type="button" className="nsp-link-btn" onClick={() => alert("Test Click Signing is not connected yet.")}>
                        Test Click Signing
                      </button>
                    </div>
                  </div>
                </div>
                )}

                {activeTab === "Custom Appearance" && (
                  <div id="nsp-section-appearance">
                    <div className="nsp-row nsp-row-editor">
                      <label>Favorite Icon<br /><small className="nsp-size-limit">Size Limit : 16x16 pixels</small></label>
                      <div className="nsp-image-box">
                        {form.favoriteIconDataUrl ? (
                          <>
                            <img src={form.favoriteIconDataUrl} alt="Favorite icon" />
                            <button type="button" className="nsp-image-remove" onClick={() => updateForm("favoriteIconDataUrl", "")} aria-label="Remove favorite icon">🗑</button>
                          </>
                        ) : (
                          <span aria-hidden="true">⚙</span>
                        )}
                      </div>
                    </div>

                    <div className="nsp-row nsp-row-editor">
                      <label>Logo Small<br /><small className="nsp-size-limit">Size Limit : 300x150 pixels</small></label>
                      <div className="nsp-image-box nsp-image-box-wide">
                        {form.logoSmallDataUrl ? (
                          <>
                            <img src={form.logoSmallDataUrl} alt="Logo small" />
                            <button type="button" className="nsp-image-remove" onClick={() => updateForm("logoSmallDataUrl", "")} aria-label="Remove logo">🗑</button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="nsp-row nsp-row-editor">
                      <label>Admin Profile Image<br /><small className="nsp-size-limit nsp-size-limit-blue">Icon Size Limit : 200x200 pixels</small></label>
                      <div className="nsp-image-box">
                        {form.adminProfileImageDataUrl ? (
                          <>
                            <img src={form.adminProfileImageDataUrl} alt="Admin profile" />
                            <button type="button" className="nsp-image-remove" onClick={() => updateForm("adminProfileImageDataUrl", "")} aria-label="Remove admin profile image">🗑</button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <hr className="nsp-section-divider" />

                    <div className="nsp-row">
                      <label>Upload</label>
                      <div className="nsp-upload-row">
                        <select value={uploadTargetKey} onChange={(event) => { setUploadTargetKey(event.target.value); setUploadFileName(""); }}>
                          {UPLOAD_TARGETS.map((target) => <option key={target.key} value={target.key}>{target.label}</option>)}
                        </select>
                        <input readOnly value={uploadFileName} placeholder="Choose file" />
                        <label className="nsp-browse-btn">
                          Browse
                          <input type="file" accept="image/*" onChange={handleUploadFile} hidden />
                        </label>
                      </div>
                    </div>

                    <div className="nsp-terminology-box">
                      <h4>Terminology</h4>
                      <div className="nsp-terminology-row">
                        <label>Affiliate</label>
                        <select value={form.terminologyAffiliate} onChange={(event) => updateForm("terminologyAffiliate", event.target.value)}>
                          {TERMINOLOGY_OPTIONS.affiliate.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </div>
                      <div className="nsp-terminology-row">
                        <label>Offer</label>
                        <select value={form.terminologyOffer} onChange={(event) => updateForm("terminologyOffer", event.target.value)}>
                          {TERMINOLOGY_OPTIONS.offer.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </div>
                      <div className="nsp-terminology-row">
                        <label>Advertiser</label>
                        <select value={form.terminologyAdvertiser} onChange={(event) => updateForm("terminologyAdvertiser", event.target.value)}>
                          {TERMINOLOGY_OPTIONS.advertiser.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </div>
                      <div className="nsp-terminology-row">
                        <label>Report</label>
                        <select value={form.terminologyReport} onChange={(event) => updateForm("terminologyReport", event.target.value)}>
                          {TERMINOLOGY_OPTIONS.report.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </div>
                      <div className="nsp-terminology-row">
                        <label>Conversion</label>
                        <select value={form.terminologyConversion} onChange={(event) => updateForm("terminologyConversion", event.target.value)}>
                          {TERMINOLOGY_OPTIONS.conversion.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </div>
                      <div className="nsp-terminology-row">
                        <label>iGaming User</label>
                        <select value={form.terminologyIGamingUser} onChange={(event) => updateForm("terminologyIGamingUser", event.target.value)}>
                          {TERMINOLOGY_OPTIONS.igamingUser.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="nsp-row">
                      <label>Font Style</label>
                      <select value={form.fontStyle} onChange={(event) => updateForm("fontStyle", event.target.value)}>
                        <option value="">Select Font Style</option>
                        {FONT_STYLE_OPTIONS.map((font) => <option key={font}>{font}</option>)}
                      </select>
                    </div>

                    <hr className="nsp-section-divider" />

                    <div className="nsp-row">
                      <label>Invoice Signature<br /><small className="nsp-size-limit">Size Limit : 200x200 pixels</small></label>
                      <div className="nsp-upload-row">
                        <input readOnly value={form.invoiceSignatureDataUrl ? "signature uploaded" : ""} placeholder="Choose file" />
                        <label className="nsp-browse-btn">
                          Browse
                          <input type="file" accept="image/*" onChange={handleInvoiceSignatureFile} hidden />
                        </label>
                      </div>
                    </div>

                    <hr className="nsp-section-divider" />

                    <div className="nsp-row nsp-row-editor">
                      <label>Chat &amp; Ticket for Affiliates/Advertiser</label>
                      <div className="nsp-chat-ticket-row">
                        <select value={form.chatTicketProvider} onChange={(event) => updateForm("chatTicketProvider", event.target.value)}>
                          {CHAT_TICKET_PROVIDERS.map((provider) => <option key={provider}>{provider}</option>)}
                        </select>
                        <input placeholder="Access Key 1" value={form.chatTicketAccessKey1} onChange={(event) => updateForm("chatTicketAccessKey1", event.target.value)} />
                        <input placeholder="Access Key 2 (optional)" value={form.chatTicketAccessKey2} onChange={(event) => updateForm("chatTicketAccessKey2", event.target.value)} />
                        <input placeholder="Access Key 3 (optional)" value={form.chatTicketAccessKey3} onChange={(event) => updateForm("chatTicketAccessKey3", event.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Affiliate" && (
                  <div id="nsp-section-affiliate">
                    <div className="nsp-row">
                      <label>Affiliate Platform Theme</label>
                      <select value={form.affiliatePlatformTheme} onChange={(event) => updateForm("affiliatePlatformTheme", event.target.value)}>
                        {AFFILIATE_PLATFORM_THEMES.map((theme) => <option key={theme}>{theme}</option>)}
                      </select>
                    </div>

                    <div className="nsp-row">
                      <label>Default Language</label>
                      <select value={form.affiliateDefaultLanguage} onChange={(event) => updateForm("affiliateDefaultLanguage", event.target.value)}>
                        <option value="">Select Language</option>
                        {LANGUAGE_OPTIONS.map((lang) => <option key={lang}>{lang}</option>)}
                      </select>
                    </div>

                    <div className="nsp-row">
                      <label>HTTP Referral</label>
                      <select value={form.httpReferral} onChange={(event) => updateForm("httpReferral", event.target.value)}>
                        {HTTP_REFERRAL_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </div>

                    <div className="nsp-row nsp-row-editor">
                      <label>Referral Commission</label>
                      <div className="nsp-referral-commission">
                        <div className="nsp-referral-commission-fields">
                          <label className="nsp-switch-field">
                            <button
                              type="button"
                              className={`nsp-switch ${form.referralCommissionEnabled ? "on" : ""}`}
                              onClick={() => updateForm("referralCommissionEnabled", !form.referralCommissionEnabled)}
                            >
                              <span />
                            </button>
                            Enable
                          </label>
                          <select value={form.referralCommissionType} onChange={(event) => updateForm("referralCommissionType", event.target.value)}>
                            <option>Percentage</option>
                            <option>Fixed</option>
                          </select>
                          <span>Days</span>
                          <input type="number" min="0" value={form.referralCommissionDays} onChange={(event) => updateForm("referralCommissionDays", event.target.value)} />
                          <span>Value</span>
                          <input type="number" min="0" value={form.referralCommissionValue} onChange={(event) => updateForm("referralCommissionValue", event.target.value)} />
                        </div>
                        <div className="nsp-chip-field">
                          {form.referralTerms.map((term) => (
                            <span className="nsp-chip" key={term}>
                              {term}
                              <button type="button" onClick={() => setForm((current) => ({ ...current, referralTerms: current.referralTerms.filter((item) => item !== term) }))} aria-label={`Remove ${term}`}>×</button>
                            </span>
                          ))}
                          <input
                            className="nsp-chip-input"
                            placeholder="Add referral term"
                            value={referralTermInput}
                            onChange={(event) => setReferralTermInput(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addReferralTerm();
                              }
                            }}
                            onBlur={addReferralTerm}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="nsp-row">
                      <label>Affiliate Payment Methods</label>
                      <div className="nsp-chip-field">
                        {form.affiliatePaymentMethods.map((method) => (
                          <span className="nsp-chip" key={method}>
                            {method}
                            <button type="button" onClick={() => removeListValue("affiliatePaymentMethods", method)} aria-label={`Remove ${method}`}>×</button>
                          </span>
                        ))}
                        <select value="" onChange={(event) => toggleListValue("affiliatePaymentMethods", event.target.value)}>
                          <option value="">+ Add</option>
                          {PAYMENT_METHOD_OPTIONS.filter((method) => !form.affiliatePaymentMethods.includes(method)).map((method) => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="nsp-row">
                      <label>Affiliate Invoice CC</label>
                      <input type="email" placeholder="cc@example.com" value={form.affiliateInvoiceCc} onChange={(event) => updateForm("affiliateInvoiceCc", event.target.value)} />
                    </div>

                    <div className="nsp-row">
                      <label>Affiliate Reports Display</label>
                      <div className="nsp-chip-field">
                        {form.affiliateReportsDisplay.map((status) => (
                          <span className="nsp-chip" key={status}>
                            {status}
                            <button type="button" onClick={() => removeListValue("affiliateReportsDisplay", status)} aria-label={`Remove ${status}`}>×</button>
                          </span>
                        ))}
                        <select value="" onChange={(event) => toggleListValue("affiliateReportsDisplay", event.target.value)}>
                          <option value="">+ Add</option>
                          {REPORT_PAYOUT_STATUS_OPTIONS.filter((status) => !form.affiliateReportsDisplay.includes(status)).map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="nsp-row">
                      <label>Affiliate Payout Display</label>
                      <div className="nsp-chip-field">
                        {form.affiliatePayoutDisplay.map((status) => (
                          <span className="nsp-chip" key={status}>
                            {status}
                            <button type="button" onClick={() => removeListValue("affiliatePayoutDisplay", status)} aria-label={`Remove ${status}`}>×</button>
                          </span>
                        ))}
                        <select value="" onChange={(event) => toggleListValue("affiliatePayoutDisplay", event.target.value)}>
                          <option value="">+ Add</option>
                          {REPORT_PAYOUT_STATUS_OPTIONS.filter((status) => !form.affiliatePayoutDisplay.includes(status)).map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="nsp-row">
                      <label>Report Fields Customization</label>
                      <div className="nsp-chip-field">
                        {form.reportFieldsCustomization.map((field) => (
                          <span className="nsp-chip" key={field}>
                            {field}
                            <button type="button" onClick={() => removeListValue("reportFieldsCustomization", field)} aria-label={`Remove ${field}`}>×</button>
                          </span>
                        ))}
                        {form.reportFieldsCustomization.length === 0 && <span className="nsp-chip-placeholder">Select</span>}
                        <select value="" onChange={(event) => toggleListValue("reportFieldsCustomization", event.target.value)}>
                          <option value="">+ Add</option>
                          {["Clicks", "Conversions", "Revenue", "Payout", "EPC", "CR"].filter((field) => !form.reportFieldsCustomization.includes(field)).map((field) => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="nsp-row">
                      <label>Postback Token Customization</label>
                      <div className="nsp-chip-field">
                        {form.postbackTokenCustomization.map((token) => (
                          <span className="nsp-chip" key={token}>
                            {token}
                            <button type="button" onClick={() => removeListValue("postbackTokenCustomization", token)} aria-label={`Remove ${token}`}>×</button>
                          </span>
                        ))}
                        {form.postbackTokenCustomization.length === 0 && <span className="nsp-chip-placeholder">Select</span>}
                        <select value="" onChange={(event) => toggleListValue("postbackTokenCustomization", event.target.value)}>
                          <option value="">+ Add</option>
                          {TRACKING_LINK_TOKEN_OPTIONS.filter((token) => !form.postbackTokenCustomization.includes(token)).map((token) => (
                            <option key={token} value={token}>{token}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="nsp-row">
                      <label>Affiliate Impression URL</label>
                      <label className="nsp-switch-field">
                        <button
                          type="button"
                          className={`nsp-switch ${form.affiliateImpressionUrlEnabled ? "on" : ""}`}
                          onClick={() => updateForm("affiliateImpressionUrlEnabled", !form.affiliateImpressionUrlEnabled)}
                        >
                          <span />
                        </button>
                        Enable
                      </label>
                    </div>

                    <div className="nsp-row">
                      <label>Affiliate Sign Up</label>
                      <label className="nsp-switch-field">
                        <button
                          type="button"
                          className={`nsp-switch ${form.affiliateSignUpEnabled ? "on" : ""}`}
                          onClick={() => updateForm("affiliateSignUpEnabled", !form.affiliateSignUpEnabled)}
                        >
                          <span />
                        </button>
                        Enable
                      </label>
                    </div>

                    <div className="nsp-row">
                      <label>Sign Up Approval</label>
                      <select value={form.signUpApproval} onChange={(event) => updateForm("signUpApproval", event.target.value)}>
                        {SIGNUP_APPROVAL_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </div>

                    <div className="nsp-row">
                      <label>Signup Fields Customization</label>
                      <input value={form.signupFieldsCustomization} onChange={(event) => updateForm("signupFieldsCustomization", event.target.value)} />
                    </div>

                    <div className="nsp-row">
                      <label>Signup Messenger Types</label>
                      <input value={form.signupMessengerTypes} onChange={(event) => updateForm("signupMessengerTypes", event.target.value)} />
                    </div>

                    <div className="nsp-signup-questions-header">
                      <label className="nsp-switch-field">
                        <button
                          type="button"
                          className={`nsp-switch ${form.signupQuestionsEnabled ? "on" : ""}`}
                          onClick={() => updateForm("signupQuestionsEnabled", !form.signupQuestionsEnabled)}
                        >
                          <span />
                        </button>
                        Enable
                      </label>
                      <label className="nsp-switch-field">
                        Allow Affiliates to choose Multiple Answers :
                        <button
                          type="button"
                          className={`nsp-switch ${form.signupQuestionsAllowMultiple ? "on" : ""}`}
                          onClick={() => updateForm("signupQuestionsAllowMultiple", !form.signupQuestionsAllowMultiple)}
                        >
                          <span />
                        </button>
                      </label>
                    </div>

                    <div className="nsp-signup-questions-table">
                      <div className="nsp-signup-questions-head">
                        <span>Question</span>
                        <span>Dropdown Answers (optional)</span>
                      </div>
                      {form.signupQuestions.map((item, index) => (
                        <div className="nsp-signup-questions-row" key={index}>
                          <input
                            placeholder={`Signup Question : ${index + 1}`}
                            value={item.question}
                            onChange={(event) => updateSignupQuestion(index, "question", event.target.value)}
                          />
                          <div className="nsp-chip-field">
                            {item.answers.map((answer) => (
                              <span className="nsp-chip" key={answer}>
                                {answer}
                                <button type="button" onClick={() => removeSignupAnswer(index, answer)} aria-label={`Remove ${answer}`}>×</button>
                              </span>
                            ))}
                            <input
                              className="nsp-chip-input"
                              value={signupAnswerInputs[index] || ""}
                              onChange={(event) => setSignupAnswerInputs((current) => ({ ...current, [index]: event.target.value }))}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  addSignupAnswer(index);
                                }
                              }}
                              onBlur={() => addSignupAnswer(index)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "Advertiser" && (
                  <div id="nsp-section-advertiser">
                    <div className="nsp-row">
                      <label>Advertiser Payment Methods</label>
                      <div className="nsp-chip-field">
                        {form.advertiserPaymentMethods.map((method) => (
                          <span className="nsp-chip" key={method}>
                            {method}
                            <button type="button" onClick={() => removeListValue("advertiserPaymentMethods", method)} aria-label={`Remove ${method}`}>×</button>
                          </span>
                        ))}
                        {form.advertiserPaymentMethods.length === 0 && <span className="nsp-chip-placeholder">Select</span>}
                        <select value="" onChange={(event) => toggleListValue("advertiserPaymentMethods", event.target.value)}>
                          <option value="">+ Add</option>
                          {PAYMENT_METHOD_OPTIONS.filter((method) => !form.advertiserPaymentMethods.includes(method)).map((method) => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="nsp-row">
                      <label>Advertiser invoice CC</label>
                      <input type="email" placeholder="cc@example.com" value={form.advertiserInvoiceCc} onChange={(event) => updateForm("advertiserInvoiceCc", event.target.value)} />
                    </div>

                    <div className="nsp-row">
                      <label>Advertiser Sign Up</label>
                      <label className="nsp-switch-field">
                        <button
                          type="button"
                          className={`nsp-switch ${form.advertiserSignUpEnabled ? "on" : ""}`}
                          onClick={() => updateForm("advertiserSignUpEnabled", !form.advertiserSignUpEnabled)}
                        >
                          <span />
                        </button>
                        Enable
                      </label>
                    </div>

                    <div className="nsp-row">
                      <label>Sign Up Approval</label>
                      <select value={form.advertiserSignUpApproval} onChange={(event) => updateForm("advertiserSignUpApproval", event.target.value)}>
                        {ADVERTISER_SIGNUP_APPROVAL_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </div>

                    <div className="nsp-row">
                      <label>Signup Fields Customization</label>
                      <input value={form.advertiserSignupFieldsCustomization} onChange={(event) => updateForm("advertiserSignupFieldsCustomization", event.target.value)} />
                    </div>

                    <div className="nsp-row">
                      <label>Signup Messenger Types</label>
                      <input value={form.advertiserSignupMessengerTypes} onChange={(event) => updateForm("advertiserSignupMessengerTypes", event.target.value)} />
                    </div>

                    <div className="nsp-row">
                      <label>Report Fields Customization</label>
                      <div className="nsp-chip-field">
                        {form.advertiserReportFieldsCustomization.map((field) => (
                          <span className="nsp-chip" key={field}>
                            {field}
                            <button type="button" onClick={() => removeListValue("advertiserReportFieldsCustomization", field)} aria-label={`Remove ${field}`}>×</button>
                          </span>
                        ))}
                        {form.advertiserReportFieldsCustomization.length === 0 && <span className="nsp-chip-placeholder">Select</span>}
                        <select value="" onChange={(event) => toggleListValue("advertiserReportFieldsCustomization", event.target.value)}>
                          <option value="">+ Add</option>
                          {["Clicks", "Conversions", "Revenue", "Payout", "EPC", "CR"].filter((field) => !form.advertiserReportFieldsCustomization.includes(field)).map((field) => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "SMTP" && (
                  <div id="nsp-section-smtp">
                    {smtpLoading ? (
                      <p className="nsp-loading">Loading SMTP settings…</p>
                    ) : (
                      <>
                        <div className="nsp-row nsp-smtp-row">
                          <label>SMTP Host</label>
                          <input value={smtpForm.host} onChange={(event) => updateSmtpForm("host", event.target.value)} placeholder="smtp.gmail.com" />
                          <button type="button" className="nsp-google-btn" onClick={setupGoogleGmail}>
                            <span aria-hidden="true">📧</span> Setup Google (Gmail)
                          </button>
                        </div>

                        <div className="nsp-row">
                          <label>SMTP Sender Name</label>
                          <input value={smtpForm.fromName} onChange={(event) => updateSmtpForm("fromName", event.target.value)} />
                        </div>

                        <div className="nsp-row">
                          <label>SMTP Email</label>
                          <input type="email" value={smtpForm.fromEmail} onChange={(event) => updateSmtpForm("fromEmail", event.target.value)} />
                        </div>

                        <div className="nsp-row">
                          <label>SMTP Username (credentials)</label>
                          <input value={smtpForm.username} onChange={(event) => updateSmtpForm("username", event.target.value)} />
                        </div>

                        <div className="nsp-row">
                          <label>SMTP Password (credentials)</label>
                          <input type="password" value={smtpForm.password} onChange={(event) => updateSmtpForm("password", event.target.value)} />
                        </div>

                        <div className="nsp-row">
                          <label>SMTP Port</label>
                          <input type="number" value={smtpForm.port} onChange={(event) => updateSmtpForm("port", event.target.value)} />
                        </div>

                        <div className="nsp-row">
                          <label>SMTP TLS/SSL</label>
                          <div className="nsp-radio-row">
                            {["SSL", "TLS", "Off"].map((mode) => (
                              <label className="nsp-radio" key={mode}>
                                <input
                                  type="radio"
                                  name="smtpEncryptionMode"
                                  checked={smtpForm.encryptionMode === mode}
                                  onChange={() => updateSmtpForm("encryptionMode", mode)}
                                />
                                {mode}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="nsp-smtp-actions">
                          <button type="button" className="nsp-submit-btn" onClick={submitSmtpForm} disabled={smtpSaving}>
                            <span aria-hidden="true">🕐</span> {smtpSaving ? "Saving…" : "Submit"}
                          </button>
                          <button type="button" className="nsp-debug-btn" onClick={debugSmtpConnection} disabled={smtpDebugging}>
                            <span aria-hidden="true">🕐</span> {smtpDebugging ? "Testing…" : "Debug"}
                          </button>
                        </div>

                        <hr className="nsp-section-divider" />

                        <div className="nsp-row">
                          <label>Test Email</label>
                          <div className="nsp-test-email-row">
                            <input type="email" placeholder="mail@test.com" value={testEmail} onChange={(event) => setTestEmail(event.target.value)} />
                            <button type="button" className="nsp-submit-btn" onClick={sendTestEmail} disabled={sendingTestEmail}>
                              <span aria-hidden="true">🕐</span> {sendingTestEmail ? "Sending…" : "Send"}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "Notifications" && (
                  <div id="nsp-section-notifications" className="nsp-notifications">
                    {NOTIFICATION_GROUPS.map(({ group, rows }) => (
                      <div className="nsp-notification-box" key={group}>
                        <h4>{group === "admin" ? "Administrator Notifications" : group === "affiliate" ? "Affiliate Notifications" : "Advertiser Notifications"}</h4>
                        <table className="nsp-notification-table">
                          <thead>
                            <tr>
                              <th>Notification</th>
                              <th>Email</th>
                              <th>In-app</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row) => {
                              const state = form.notificationSettings[group][row.key];
                              return (
                                <tr key={row.key}>
                                  <td>{row.label}</td>
                                  <td>
                                    <label className="nsp-switch-field">
                                      <button
                                        type="button"
                                        className={`nsp-switch ${state.email ? "on" : ""}`}
                                        onClick={() => toggleNotification(group, row.key, "email")}
                                      >
                                        <span />
                                      </button>
                                      {state.email ? "On" : "Off"}
                                    </label>
                                  </td>
                                  <td>
                                    {row.hasInApp ? (
                                      <label className="nsp-switch-field">
                                        <button
                                          type="button"
                                          className={`nsp-switch ${state.inapp ? "on" : ""}`}
                                          onClick={() => toggleNotification(group, row.key, "inapp")}
                                        >
                                          <span />
                                        </button>
                                        {state.inapp ? "On" : "Off"}
                                      </label>
                                    ) : (
                                      <span className="nsp-notification-dash">--</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}

                    <div className="nsp-notification-box">
                      <h4>External Channel Setup</h4>

                      <div className="nsp-channel-row">
                        <label>Notification Prefix</label>
                        <input value={form.notificationPrefix} onChange={(event) => updateForm("notificationPrefix", event.target.value)} placeholder="Production" />
                        <button type="button" className="nsp-channel-btn" onClick={savePrefix} disabled={savingPrefix}>
                          {savingPrefix ? "Saving…" : "Save"}
                        </button>
                      </div>
                      <p className="nsp-channel-preview">Preview : [{form.notificationPrefix || "Production"}] New Affiliate Signup - John Doe</p>

                      <div className="nsp-channel-row">
                        <label><span aria-hidden="true">✈</span> Telegram</label>
                        <input placeholder="Enter Bot Token" value={form.telegramBotToken} onChange={(event) => updateForm("telegramBotToken", event.target.value)} />
                        <input placeholder="Enter Chat ID" value={form.telegramChatId} onChange={(event) => updateForm("telegramChatId", event.target.value)} />
                        <button type="button" className="nsp-channel-btn" onClick={fetchTelegramChats} disabled={fetchingChats}>
                          {fetchingChats ? "Fetching…" : "Fetch Chats"}
                        </button>
                        <button type="button" className="nsp-channel-btn nsp-channel-btn-connect" onClick={connectTelegram} disabled={connectingTelegram}>
                          {connectingTelegram ? "Connecting…" : "Connect"}
                        </button>
                      </div>
                      <p className="nsp-channel-hint">⚠ Before fetching chats, ensure the bot has received at least one message in the target group/channel.</p>

                      <div className="nsp-channel-row">
                        <label><span aria-hidden="true">💬</span> Slack</label>
                        <input placeholder="Enter Webhook URL" value={form.slackWebhookUrl} onChange={(event) => updateForm("slackWebhookUrl", event.target.value)} />
                        <button type="button" className="nsp-channel-btn nsp-channel-btn-connect" onClick={connectSlack} disabled={connectingSlack}>
                          {connectingSlack ? "Connecting…" : "Connect"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab !== "General" && activeTab !== "Tracking" && activeTab !== "Custom Appearance" && activeTab !== "Affiliate" && activeTab !== "Advertiser" && activeTab !== "SMTP" && activeTab !== "Notifications" && (
                  <p className="nsp-loading">This section is not available yet.</p>
                )}

                {activeTab !== "SMTP" && (
                  <div className="nsp-submit-row">
                    <button type="button" className="nsp-submit-btn" onClick={submitForm} disabled={saving}>
                      <span aria-hidden="true">🕐</span> {saving ? "Saving…" : "Submit"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
