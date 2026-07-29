import './css/App.css';
import HomePage from './pages/HomePage.jsx';
import FestiveAuth from './pages/FestiveAuth';
import ProviderAuth from './pages/ProviderAuth';
import CategoryServicesPage from './pages/CategoryServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import ScrollToTop from './components/ScrollToTop';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import { UserProvider } from './context/UserContext';
import { ProviderProvider } from './context/ProviderContext';
import { ThemeProvider } from './context/ThemeContext';
import Favourites from "./pages/Favourites";
import ChatPage from './pages/ChatPage.jsx';
import ProviderDashboard from "./pages/ProviderDashboard";
import AddService from "./pages/AddService";
import MyReviewsPage from './pages/MyReviewsPage';
import MyAccountPage from './pages/MyAccountPage';
import DashboardPage from './pages/DashboardPage.jsx';
import ProviderChatPage from './pages/ProviderChatPage.jsx';
import BookServicePage from "./pages/BookServicePage";
import EditService from "./pages/EditService.jsx";
import UserBookingsPage from './pages/UserBookingsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AboutUsPage from './pages/info/AboutUsPage.jsx';
import TeamPage from './pages/info/TeamPage.jsx';
import ContactUsPage from './pages/info/ContactUsPage.jsx';
import ReportFraudPage from './pages/info/ReportFraudPage.jsx';
import PrivacyPolicyPage from './pages/info/PrivacyPolicyPage.jsx';
import TermsAndConditionsPage from './pages/info/TermsAndConditionsPage.jsx';
import RefundPolicyPage from './pages/info/RefundPolicyPage.jsx';
import BlogPage from './pages/info/BlogPage.jsx';
import CareersPage from './pages/info/CareersPage.jsx';
import InvestorRelationsPage from './pages/info/InvestorRelationsPage.jsx';
import CorporatePage from './pages/info/CorporatePage.jsx';
import SecurityPage from './pages/info/SecurityPage.jsx';
import PiracyPage from './pages/info/PiracyPage.jsx';
import CookiePolicyPage from './pages/info/CookiePolicyPage.jsx';
import ContentPoliciesPage from './pages/info/ContentPoliciesPage.jsx';

function App() {
  return (
    <>
      <ScrollToTop />

      <ThemeProvider>
        <ProviderProvider>
          <UserProvider>

            <Routes>
              {/* Authentication Routes (No Layout) */}
              <Route path="/login" element={<FestiveAuth />} />
              <Route path="/provider-login" element={<ProviderAuth />} />

              {/* Provider Dashboard Routes (No Layout) */}
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/provider/add-service" element={<AddService />} />
              <Route path="/provider/edit-service" element={<EditService />} />
              <Route path="/provider/chat" element={<ProviderChatPage />} />
              <Route path="/provider/chat/:conversationId" element={<ProviderChatPage />} />


              {/* --- Main Site Routes (These use the Navbar/Footer from MainLayout) --- */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/my-account" element={<MyAccountPage />} />
                <Route path="/category/:slug" element={<CategoryServicesPage />} />
                <Route path="/service/:id" element={<ServiceDetailsPage />} />

                <Route path="/my-reviews" element={<MyReviewsPage />} />
                <Route path="/favourites" element={<Favourites />} />
                <Route path="/my-bookings" element={<UserBookingsPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/search-results" element={<SearchResultsPage />} />

                {/* Footer Info Routes */}
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/report-fraud" element={<ReportFraudPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsAndConditionsPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/investor-relations" element={<InvestorRelationsPage />} />
                <Route path="/corporate" element={<CorporatePage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/piracy" element={<PiracyPage />} />
                <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                <Route path="/content-policies" element={<ContentPoliciesPage />} />
              </Route>

              {/* --- Fullscreen App Routes (These DO NOT use MainLayout) --- */}
              <Route path="/book/:id" element={<BookServicePage />} />
              <Route path="/chat/:conversationId" element={<ChatPage />} />
              <Route path="/chat" element={<ChatPage />} />

              {/* 2. This route matches any path that wasn't matched above */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

          </UserProvider>
        </ProviderProvider>
      </ThemeProvider>
    </>
  );
}

export default App;