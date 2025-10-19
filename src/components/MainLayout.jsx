import React from "react";
import Navbar from "./Navbar"; // Your Navbar component
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return (
        <>
            <Navbar />    {/* Navbar shown here */}
            <Outlet />
            <Footer />  {/* Page content rendered here */}
        </>
    );
};

export default MainLayout;
