import './css/App.css'
import HomePage from './pages/home'
import FestiveAuth from './pages/FestiveAuth';
import AllCategoriesPage from './pages/AllCategoriesPage';
import CategoryServicesPage from './pages/CategoryServicesPage';
import AllServicesPage from './pages/AllServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import ScrollToTop from './components/ScrollToTop';
import { Routes, Route } from "react-router-dom";
import MainLayout from './components/MainLayout';
import { UserProvider } from './context/UserContext';
import Favourites from "./pages/FavouritesPage";

function App() {
    return (<>
        <ScrollToTop />
        <UserProvider>
            <Routes>
                <Route path="/login" element={<FestiveAuth />} />
                {/* Routes with Navbar */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/categories" element={<AllCategoriesPage />} />
                    <Route path="/category/:id" element={<CategoryServicesPage />} />
                    <Route path="/service/:id" element={<ServiceDetailsPage />} />
                    <Route path="/services" element={<AllServicesPage />} />
                    <Route path="/favourites" element={<Favourites />} />
                </Route>
            </Routes>
        </UserProvider>
    </>
    );
}

export default App
