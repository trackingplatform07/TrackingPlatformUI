import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import ForgotPassword from './ForgotPassword';
import CreateUser from "./CreateUser";
import UserManager from "./pages/UserManager";
import EditUserPage from "./pages/EditUserPage";
import AffiliatePage from "./pages/AffiliatesPage";
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
import ImportAffiliates from "./pages/ImportAffiliates";
import CreateOfferPage from "./pages/CreateOfferPage";

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
<Route path="/offers/create" element={<CreateOfferPage />} />s

      </Routes>
    </div>
  );
}
 
export default App
 
 