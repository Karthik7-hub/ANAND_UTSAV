import './css/App.css';
import HomePage from './pages/HomePage.jsx';
import FestiveAuth from './pages/FestiveAuth';
import ProviderAuth from './pages/ProviderAuth';
import AllCategoriesPage from './pages/AllCategoriesPage';
import CategoryServicesPage from './pages/CategoryServicesPage';
import AllServicesPage from './pages/AllServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import ScrollToTop from './components/ScrollToTop';
import { Routes, Route } from "react-router-dom";
import MainLayout from './components/MainLayout';
import { UserProvider } from './context/UserContext';
import { ProviderProvider } from './context/ProviderContext';
import Favourites from "./pages/Favourites";
import ChatPage from './pages/ChatPage.jsx';
import ProviderDashboard from "./pages/ProviderDashboard";
import AddService from "./pages/AddService";
import MyReviewsPage from './pages/MyReviewsPage';
import MyAccountPage from './pages/MyAccountPage';
import DashboardPage from './pages/DashboardPage.jsx';
import ProviderChatPage from './pages/ProviderChatPage.jsx';
function App() {
  return (
    <>
      <ScrollToTop />
      <ProviderProvider>
        <UserProvider>
          <Routes>
            {/* Authentication Routes (No Layout) */}
            <Route path="/login" element={<FestiveAuth />} />
            <Route path="/provider-login" element={<ProviderAuth />} />

            {/* Provider Dashboard Routes (No Layout) */}
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/provider/add-service" element={<AddService />} />
            <Route path="/provider/chat" element={<ProviderChatPage />} />
            <Route path="/provider/chat/:conversationId" element={<ProviderChatPage />} />


            {/* --- Main Site Routes (These use the Navbar/Footer from MainLayout) --- */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/my-account" element={<MyAccountPage />} />
              <Route path="/categories" element={<AllCategoriesPage />} />
              <Route path="/category/:slug" element={<CategoryServicesPage />} />
              <Route path="/service/:id" element={<ServiceDetailsPage />} />
              <Route path="/my-reviews" element={<MyReviewsPage />} />
              <Route path="/services" element={<AllServicesPage />} />
              <Route path="/favourites" element={<Favourites />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* The chat routes have been MOVED out of here */}
            </Route>

            {/* --- Fullscreen App Routes (These DO NOT use MainLayout) --- */}
            <Route path="/chat/:conversationId" element={<ChatPage />} />
            <Route path="/chat" element={<ChatPage />} />

          </Routes>
        </UserProvider>
      </ProviderProvider>
    </>
  );
}

export default App;