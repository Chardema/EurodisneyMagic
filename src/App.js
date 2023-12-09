import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Hours from './Hours/Hours';
import Attractions from './Attractions/AttractionsPage';
import Spectacle from './SpectaclePage/SpectaclePage';
import MagicAITrip from './MagicTripAI/MagicAITripPage';
import {Provider} from "react-redux";
import store from "./redux/store";
import { Analytics } from '@vercel/analytics/react';
const App = () => {
    return (
        <Provider store={store}>
            <Analytics />
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Hours />} />
                    <Route path="/attractions" element={<Attractions />} />
                    <Route path="/spectacle" element={<Spectacle />} />
                    <Route path="/magicAITrip" element={<MagicAITrip />} />
                </Routes>
            </div>
        </Router>
        </Provider>
    );
};

export default App;
