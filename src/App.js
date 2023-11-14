import React, { useState,useEffect } from 'react';
import Slider from 'react-slick';
import DRSDiscoveryland from './img/Disneyland Railroad Discoveryland Station.jpg';
import DRSFrontierland from './img/Disneyland Railroad Frontierland Depot.jpg'
import Orbitron from './img/Orbitron.jpg';
import MeetMickey from './img/MeetMickey.jpg'
import FrontierLandPg from './img/FrontierlandPlayground.jpg'
import DRSFantasyland from './img/FantasylandRailRoad.jpg'
import GalionPirate from './img/PirateGalleon.jpg'
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ThemeParkInfo from "./ThemeParkInfo";
import './App.css';
import Navbar from "./Navbar/Navbar";


const attractionImages = {
    'Disneyland Railroad Discoveryland Station': DRSDiscoveryland,
    'Orbitron®': Orbitron,
    'Meet Mickey Mouse': MeetMickey,
    'Frontierland Playground': FrontierLandPg,
    'Disneyland Railroad Frontierland Depot':DRSFrontierland,
    'Pirate Galleon':GalionPirate,
    'Disneyland Railroad Fantasyland Station':DRSFantasyland
};
function App() {
    const [rawRideData, setRawRideData] = useState([]);
    const [filteredRideData, setFilteredRideData] = useState([]);
    const [closedRideData, setClosedRideData] = useState( [])

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3
    };

    useEffect(() => {
        const openAttractions = rawRideData.filter(
            ride => ride.status === 'OPERATING' || (ride.status && ride.status === 'OPERATING')
        );
        const closedAttractions = rawRideData.filter(
            ride => ride.status === 'CLOSED' || (ride.status && ride.status == 'CLOSED')
        );
        const filteredAttractions = openAttractions.filter(
            ride => ride.entityType !== 'SHOW'
        );
        setClosedRideData(closedAttractions);
        setFilteredRideData(filteredAttractions);
    }, [rawRideData]);

    return (
        <div className="container">
            <Navbar />
            <ThemeParkInfo setRawRideData={setRawRideData} />
            <div className="sliderContainer">
                <div className="OpenAttractionSlider">
                    <h2>Profitez d'une journée magique en profitant de ces attractions:</h2>
                    <Slider {...sliderSettings}>
                        {filteredRideData.map((ride, index) => (
                            <div key={index} className="card">
                                <img src={attractionImages[ride.name]} alt={ride.name} className="imgAttraction" />
                                <div className="cardText">
                                    {ride.queue && ride.queue.STANDBY ? (
                                        <p className="textOpenAttraction">{`${ride.name}: ${ride.queue.STANDBY.waitTime} minutes d'attente (Ouvert)`}</p>
                                    ) : null}
                                    <button className="buttonCard">Je m'y rend</button>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
                <div className="OpenAttractionSlider">
                    <h2>Ces attractions sont fermées</h2>
                    <Slider {...sliderSettings}>
                        {closedRideData.map((ride, index) => (
                            <div key={index} className="card">
                                <img src={attractionImages[ride.name]} alt={ride.name} className="imgAttraction" />
                                <div className="cardText">
                                    <p className="textOpenAttraction">{`L'attraction ${ride.name} est actuellement fermé`}</p>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
}

export default App;
