import React from 'react';
import './Navbar.css'; // Assurez-vous de créer un fichier CSS nommé Navbar.css avec le code ci-dessous.

const Navbar = () => {
    return (
        <nav className="navbar">
            <h1>EuroDisneyMagic</h1>
            <ul>
                <li><a href="#attractions">Attractions</a></li>
                <li><a href="#spectacle">Spectacle</a></li>
                <li><a href="#magicAITrip">MagicAITrip</a></li>
            </ul>
        </nav>
    );
};

export default Navbar;
