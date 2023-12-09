import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Hours from './Hours/Hours';
import Attractions from './Attractions/AttractionsPage';
import Spectacle from './SpectaclePage/SpectaclePage';
import MagicAITrip from './MagicTripAI/MagicAITripPage';
import {Provider} from "react-redux";
import store from "./redux/store";
import { Analytics } from '@vercel/analytics/react';
import HomePage from "./Home/appHome";

const App = () => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    const toggleFavorite = (attraction) => {
        let newFavorites;
        if (favorites.some(fav => fav.id === attraction.id)) {
            newFavorites = favorites.filter(fav => fav.id !== attraction.id);
        } else {
            newFavorites = [...favorites, attraction];
        }
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    return (
        <Provider store={store}>
            <Analytics />
            <Router>
                <div>
                    <Routes>
                        <Route path="/" element={<HomePage favorites={favorites} />} />
                        <Route path="/hours" element={<Hours />} />
                        <Route path="/attractions" element={<Attractions favorites={favorites} toggleFavorite={toggleFavorite} />} />
                        <Route path="/spectacle" element={<Spectacle />} />
                        <Route path="/magicAITrip" element={<MagicAITrip />} />
                    </Routes>
                </div>
            </Router>
        </Provider>
    );
};

export default App;