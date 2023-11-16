import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logosansbg from './../img/logosansbg.png'
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <img  className="logo" src={logosansbg} alt="logo"/>
            <ul>
                <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
                <li><Link to="/attractions" className={location.pathname === '/attractions' ? 'active' : ''}>Attractions</Link></li>
                <li><Link to="/spectacle" className={location.pathname === '/spectacle' ? 'active' : ''}>Spectacle</Link></li>
                <li><Link to="/magicAITrip" className={location.pathname === '/magicAITrip' ? 'active' : ''}>MagicAITrip</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
