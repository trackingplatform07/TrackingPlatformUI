import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import ForgotPassword from './ForgotPassword';
import CreateUser from "./CreateUser";
import UserManager from "./pages/UserManager";
import EditUserPage from "./pages/EditUserPage";
import AffiliatePage from "./pages/AffiliatesPage";
import PendingAffiliatesPage from "./pages/PendingAffiliatesPage";
import AdvertisersPage from "./pages/AdvertisersPage";
import AdvertisersBilling from "./pages/AdvertisersBilling";
import ImportPage from "./pages/ImportPage";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceSettings from "./pages/InvoiceSettings";
import CreateInvoiceRule from "./pages/CreateInvoiceRule";
import AdvertiserDetails from "./pages/AdvertiserDetails";
import AffiliateSignup from "./AffiliateSignup";
import AffiliateDetails from "./pages/AffiliateDetails"; 
import AffiliatePostback from "./pages/AffiliatePostback";
import AffiliatePostbackListPage from "./pages/AffiliatePostbackListPage";
import AffiliateBillingPage from "./pages/AffiliateBillingPage";
import CreateAffiliateInvoicePage from "./pages/CreateAffiliateInvoicePage";
import AffiliateReferralPage from "./pages/AffiliateReferralPage";
import AffiliatePostbackTestPage from "./pages/AffiliatePostbackTestPage";
import AffiliatePostbackTestLogsPage from "./pages/AffiliatePostbackTestLogsPage";
import ImportAffiliates from "./pages/ImportAffiliates";
import CreateOfferPage from "./pages/CreateOfferPage";
import EditOfferPage from "./pages/EditOfferPage";
import ApprovedOffersPage from "./pages/ApprovedOffersPage";
import SmartOffersPage from "./pages/SmartOffersPage";
import PostbackPage from "./pages/PostbackPage";
import ApproveRequestsPage from "./pages/ApproveRequestsPage";
import CouponsPage from "./pages/CouponsPage";
import OfferLinkingRulesPage from "./pages/OfferLinkingRulesPage";
import OffersLivePage from "./pages/OffersLivePage";
import ReportsPage from "./pages/ReportsPage";
import ReportsKpiPage from "./pages/ReportsKpiPage";
import ConversionLogsPage from "./pages/ConversionLogsPage";
import IGamingReportsPage from "./pages/IGamingReportsPage";
import AffiliatePostbackLogsPage from "./pages/AffiliatePostbackLogsPage";
import AdvertiserPostbackLogsPage from "./pages/AdvertiserPostbackLogsPage";
import CappingLogsPage from "./pages/CappingLogsPage";
import TestReportsPage from "./pages/TestReportsPage";
import OtpReportsPage from "./pages/OtpReportsPage";
import ComparisonReportPage from "./pages/ComparisonReportPage";
import FraudFenderPage from "./pages/FraudFenderPage";
import ConversionRiskMonitorPage from "./pages/ConversionRiskMonitorPage";
import MobileAttributionPage from "./pages/MobileAttributionPage";
import ECommerceIntegrationPage from "./pages/ECommerceIntegrationPage";
import AffiliateIntegrationPage from "./pages/AffiliateIntegrationPage";
import OfferSyncPage from "./pages/OfferSyncPage";
import ReportSyncPage from "./pages/ReportSyncPage";
import ProductFeedPage from "./pages/ProductFeedPage";
import OtpIntegrationPage from "./pages/OtpIntegrationPage";
import OtpIntegrationSetupPage from "./pages/OtpIntegrationSetupPage";
import MailerPage from "./pages/MailerPage";
import DefaultMailerTemplatePage from "./pages/DefaultMailerTemplatePage";
import CustomMailerTemplatesPage from "./pages/CustomMailerTemplatesPage";
import AutomationPage from "./pages/AutomationPage";
import LinkTesterPage from "./pages/LinkTesterPage";
import FraudDetectionToolsPage from "./pages/FraudDetectionToolsPage";
import ShortUrlPage from "./pages/ShortUrlPage";
import SuppressionListPage from "./pages/SuppressionListPage";
import SettingsPage from "./pages/SettingsPage";
import BillingPage from "./pages/BillingPage";
import ProfilePage from "./pages/ProfilePage";
import EmployeeAccessPage from "./pages/EmployeeAccessPage";
import SecurityPage from "./pages/SecurityPage";
import ChangeLogsPage from "./pages/ChangeLogsPage";
import AccessLogsPage from "./pages/AccessLogsPage";
import ReferralPage from "./pages/ReferralPage";
import BillingOverviewPage from "./pages/BillingOverviewPage";
import TicketsPage from "./pages/TicketsPage";
import CallSupportPage from "./pages/CallSupportPage";
import KnowledgebasePage from "./pages/KnowledgebasePage";

import './css/App.css';
 
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/user-manager" element={<UserManager />} />
        <Route path="/edit-user/:id" element={<EditUserPage />} />
        <Route path="/affiliates" element={<AffiliatePage />} />
        <Route path="/affiliates/pending" element={<PendingAffiliatesPage />} />
        <Route path="/advertisers" element={<AdvertisersPage />} />
        <Route path="/advertisers-billing" element={<AdvertisersBilling />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/import-affiliates" element={<ImportAffiliates />} />
        <Route path="/create-invoice" element={<CreateInvoice />} />
        <Route path="/invoice-settings" element={<InvoiceSettings />} />
        <Route path="/create-invoice-rule" element={<CreateInvoiceRule />} />
        <Route path="/advertiser/:id" element={<AdvertiserDetails />} />
        <Route path="/affiliate-signup" element={<AffiliateSignup />} />
        <Route path="/affiliate/:id" element={<AffiliateDetails />} /> 
        <Route path="/affiliate-postback" element={<AffiliatePostback />} />
        <Route path="/affiliates/postback" element={<AffiliatePostbackListPage />} />
        <Route path="/affiliates/billing" element={<AffiliateBillingPage />} />
        <Route path="/affiliates/billing/create" element={<CreateAffiliateInvoicePage />} />
        <Route path="/affiliates/referral" element={<AffiliateReferralPage />} />
        <Route path="/affiliates/postback-test" element={<AffiliatePostbackTestPage />} />
        <Route path="/affiliates/postback-test/logs" element={<AffiliatePostbackTestLogsPage />} />
        <Route path="/offers/create" element={<CreateOfferPage />} />
        <Route path="/offers/:id/edit" element={<EditOfferPage />} />
        <Route path="/offers/approved" element={<ApprovedOffersPage />} />
        <Route path="/offers/smart" element={<SmartOffersPage />} />
        <Route path="/offers/postback" element={<PostbackPage />} />
        <Route path="/offers/approve-requests" element={<ApproveRequestsPage />} />
        <Route path="/offers/coupons" element={<CouponsPage />} />
        <Route path="/offers/affiliate-links" element={<OfferLinkingRulesPage />} />
        <Route path="/offers/live" element={<OffersLivePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/kpi" element={<ReportsKpiPage />} />
        <Route path="/reports/conversion-logs" element={<ConversionLogsPage />} />
        <Route path="/reports/igaming" element={<IGamingReportsPage />} />
        <Route path="/reports/affiliate-postback-logs" element={<AffiliatePostbackLogsPage />} />
        <Route path="/reports/advertiser-postback-logs" element={<AdvertiserPostbackLogsPage />} />
        <Route path="/reports/capping-logs" element={<CappingLogsPage />} />
        <Route path="/reports/test-reports" element={<TestReportsPage />} />
        <Route path="/reports/otp-reports" element={<OtpReportsPage />} />
        <Route path="/reports/comparison" element={<ComparisonReportPage />} />
        <Route path="/fraud-detection/fraud-fender" element={<FraudFenderPage />} />
        <Route path="/fraud-detection/conversion-risk-monitor" element={<ConversionRiskMonitorPage />} />
        <Route path="/integration/mobile-attribution" element={<MobileAttributionPage />} />
        <Route path="/integration/e-commerce" element={<ECommerceIntegrationPage />} />
        <Route path="/integration/affiliate-integration" element={<AffiliateIntegrationPage />} />
        <Route path="/integration/offer-sync" element={<OfferSyncPage />} />
        <Route path="/integration/report-sync" element={<ReportSyncPage />} />
        <Route path="/integration/product-feed" element={<ProductFeedPage />} />
        <Route path="/integration/otp-integration" element={<OtpIntegrationPage />} />
        <Route path="/integration/otp-integration/:partnerKey" element={<OtpIntegrationSetupPage />} />
        <Route path="/tools/integration" element={<MobileAttributionPage />} />
        <Route path="/tools/mailer" element={<MailerPage />} />
        <Route path="/tools/mailer/templates" element={<DefaultMailerTemplatePage />} />
        <Route path="/tools/mailer/custom-templates" element={<CustomMailerTemplatesPage />} />
        <Route path="/tools/import-data" element={<ImportPage />} />
        <Route path="/tools/automation" element={<AutomationPage />} />
        <Route path="/tools/link-tester" element={<LinkTesterPage />} />
        <Route path="/tools/fraud-detection" element={<FraudDetectionToolsPage />} />
        <Route path="/tools/short-url" element={<ShortUrlPage />} />
        <Route path="/tools/suppression-list" element={<SuppressionListPage />} />
        <Route path="/account/settings" element={<SettingsPage />} />
        <Route path="/account/billing" element={<BillingPage />} />
        <Route path="/account/profile" element={<ProfilePage />} />
        <Route path="/account/employee" element={<EmployeeAccessPage />} />
        <Route path="/account/security" element={<SecurityPage />} />
        <Route path="/account/change-logs" element={<ChangeLogsPage />} />
        <Route path="/account/access-logs" element={<AccessLogsPage />} />
        <Route path="/account/referral" element={<ReferralPage />} />
        <Route path="/billing" element={<BillingOverviewPage />} />
        <Route path="/support/tickets" element={<TicketsPage />} />
        <Route path="/support/call" element={<CallSupportPage />} />
        <Route path="/support/knowledgebase" element={<KnowledgebasePage />} />

      </Routes>
    </div>
  );
}
 
export default App
 
 
