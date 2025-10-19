import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import ServiceGrid from '../components/ServiceSection';

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Hero />
            <CategorySection />
            <ServiceGrid />
        </div>
    );
}
