import './css/App.css';
import HomePage from './pages/home';
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
import Favourites from "./pages/Favourites";
import ChatPage from './pages/ChatPage.jsx';


import ProviderDashboard from "./pages/ProviderDashboard";
import AddService from "./pages/AddService";
import MyReviewsPage from './pages/MyReviewsPage';
import MyAccountPage from './pages/MyAccountPage';
import DashboardPage from './pages/DashboardPage.jsx';
function App() {
  return (
    <>
      <ScrollToTop />
      <UserProvider>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<FestiveAuth />} />
          <Route path="/provider-login" element={<ProviderAuth />} />

          {/* Provider Dashboard Routes */}
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/add-service" element={<AddService />} />

          {/* Routes with MainLayout / Navbar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/my-account" element={<MyAccountPage />} />

            <Route path="/categories" element={<AllCategoriesPage />} />
            <Route path="/category/:id" element={<CategoryServicesPage />} />
            <Route path="/service/:id" element={<ServiceDetailsPage />} />
            <Route path="/my-reviews" element={<MyReviewsPage />} />
            <Route path="/services" element={<AllServicesPage />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Add ChatPage route */}
            <Route path="/chat/:conversationId" element={<ChatPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
        </Routes>
      </UserProvider>
    </>
  );
}

export default App;
