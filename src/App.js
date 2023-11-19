import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './Home/Homepage';
import Attractions from './Attractions/AttractionsPage';
import Spectacle from './SpectaclePage/SpectaclePage';
import MagicAITrip from './MagicTripAI/MagicAITripPage';
import {Provider} from "react-redux";
import store from "./redux/store";
require('dotenv').config();


const App = () => {
    return (
        <Provider store={store}>
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Homepage />} />
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
