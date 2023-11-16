import React from 'react';
import Navbar from "../Navbar/Navbar";
import {Link} from "react-router-dom";
import Attractions from "../Attractions/AttractionsPage";

const MagicAITrip = () => {
    return (
        <div>
            <Navbar />
            <h2>Accèdez aux attractions</h2>
            <Link to={Attractions}>ici </Link>
            {/* Ajoutez le contenu de la page d'accueil */}
        </div>
    );
};

export default MagicAITrip;
