import React from "react";
import { Link, useLocation } from "react-router-dom";
import '../styles/Common.css';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
                종목검색
            </Link>
            <Link to="/financial-statements" className={location.pathname === "/financial-statements" ? "active" : ""}>
                재무 top100
            </Link>
        </nav>
    );
};

export default Navbar;
