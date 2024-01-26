import React, {useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Hours from './Hours/Hours';
import Attractions from './Attractions/AttractionsPage';
import Spectacle from './SpectaclePage/SpectaclePage';
import MagicAITrip from './MagicTripAI/MagicAITripPage';
import { Provider } from "react-redux";
import store from "./redux/store";
import { Analytics } from '@vercel/analytics/react';
import HomePage from "./Home/appHome";
import {setFavorites} from "./redux/actions";
import { setAttractions } from './redux/actions';
import axios from "axios"; // Assurez-vous d'importer l'action

const App = () => {
    // Chargement initial des favoris depuis localStorage
    useEffect(() => {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
            const initialFavorites = JSON.parse(storedFavorites);
            store.dispatch(setFavorites(initialFavorites)); // Utilisation du store importé
        }
    }, []);

    // Abonnement au store Redux pour persister les favoris dans localStorage
    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const state = store.getState();
            const serializedFavorites = JSON.stringify(state.favorites.favorites);
            localStorage.setItem('favorites', serializedFavorites);
        });

        return () => unsubscribe(); // Nettoyage de l'abonnement
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Remplacez cette URL par l'URL de votre API
                const response = await axios.get('https://eurojourney.azurewebsites.net/api/attractions');
                const attractionsData = response.data;

                // Dispatcher l'action pour mettre à jour les attractions dans Redux
                store.dispatch(setAttractions(attractionsData));
            } catch (error) {
                console.error('Erreur lors de la récupération des données des attractions:', error);
            }
        };

        // Appel initial pour charger les données
        fetchData();

        // Définir un intervalle pour la mise à jour périodique
        const intervalId = setInterval(fetchData, 60000); // Mise à jour toutes les 60 secondes

        // Nettoyer l'intervalle lors du démontage du composant
        return () => clearInterval(intervalId);
    }, []);

    return (
        <Provider store={store}>
            <Analytics />
            <Router>
                <div>
                    <Routes>
                        <Route path="/" element={<HomePage />} /> {/* Retirez les props qui ne sont plus nécessaires */}
                        <Route path="/hours" element={<Hours />} />
                        <Route path="/attractions" element={<Attractions />} /> {/* Retirez les props qui ne sont plus nécessaires */}
                        <Route path="/spectacle" element={<Spectacle />} />
                        <Route path="/magicAITrip" element={<MagicAITrip />} />
                    </Routes>
                </div>
            </Router>
        </Provider>
    );
};

export default App;
