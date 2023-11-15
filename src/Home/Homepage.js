import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import axios from "axios";
import DRSDiscoveryland from './../img/Disneyland Railroad Discoveryland Station.jpg';
import DRSFrontierland from './../img/Disneyland Railroad Frontierland Depot.jpg';
import DRSMainStreet from './../img/MainstreetStation.jpg'
import Orbitron from './../img/Orbitron.jpg';
import MeetMickey from './../img/MeetMickey.jpg';
import FrontierLandPg from './../img/FrontierlandPlayground.jpg';
import GalionPirate from './../img/PirateGalleon.jpg'
import DRSFantasyland from './../img/FantasylandRailRoad.jpg';
import DR from './../img/DisneylandRailroad.jpg'
import Pirates from './../img/Pirateofthecarribean.jpg'
import PP from './../img/Pavillon Princesse.jpg'
import IndianaJones from './../img/IndianaJonesetletempleduperil.jpg';
import CabaneRobinson from './../img/CabaneRobinson.JPG';
import PhantomManor from './../img/Phantommanor.jpg'
import ISW from './../img/its a small world.jpg'
import StarTours from './../img/Startour.jpg'
import HSM from './../img/Hyperspacemountain.jpg'
import MN from './../img/Nautilus.jpg'
import Caroussel from './../img/Carroussellancelot.jpg'
import BTM from './../img/BTM.jpg';
import PPF from './../img/Peterpanflight.jpg'
import DFE from './../img/Dumboflying.jpg'
import PEA from './../img/Passagealadin.jpg'
import autopia from './../img/Autopia.jpg'
import BlancheNeige from './../img/BlancheNeige.jpg'
import AdventureIsle from './../img/AdventureIsle.jpg'
import StartPort from './../img/Startport.jpg'
import Alice from './../img/Alicelabyrinthe.jpg'
import Buzz from './../img/buzz lightyear.jpg'
import MHTC from './../img/TeaCup.jpg'
import RRSG from './../img/ShootinGallery.jpg'
import TD from './../img/Tanière dragon.jpg'
import MickeyPhil from './../img/orchestrephilarmagique.jpg'
import PaysConte from '../img/PaysConte.jpg'
import ThunderMesa from './../img/ThunderMesa.jpg'
import Pinocchio from './../img/Pinocchio.jpg'
import Casey from './../img/CaseyJr.jpg'
import MSV from './../img/Mainstreetvehicles.jpg'
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ThemeParkInfo from './../ThemeParkInfo';
import './Homepage.css';
import Navbar from './../Navbar/Navbar';
import useInterval from './../useInterval';// Assurez-vous d'importer useInterval depuis le fichier correspondant

const attractionImages = {
    'Disneyland Railroad Discoveryland Station': DRSDiscoveryland,
    'Disneyland Railroad Fantasyland Station': DRSFantasyland,
    'Disneyland Railroad Main Street Station': DRSMainStreet,
    'Disneyland Railroad': DR,
    'Orbitron®': Orbitron,
    'Meet Mickey Mouse': MeetMickey,
    'Frontierland Playground': FrontierLandPg,
    'Disneyland Railroad Frontierland Depot': DRSFrontierland,
    'Pirate Galleon': GalionPirate,
    'Indiana Jones™ and the Temple of Peril':IndianaJones,
    'La Cabane des Robinson':CabaneRobinson,
    'Big Thunder Mountain':BTM,
    "Mad Hatter's Tea Cups":MHTC,
    'Les Voyages de Pinocchio':Pinocchio,
    'Casey Jr. – le Petit Train du Cirque':Casey,
    'Phantom Manor': PhantomManor,
    'Star Wars Hyperspace Mountain':HSM,
    'Star Tours: The Adventures Continue*':StarTours,
    'Thunder Mesa Riverboat Landing':ThunderMesa,
    "Alice's Curious Labyrinth":Alice,
    "Buzz Lightyear Laser Blast":Buzz,
    'Main Street Vehicles':MSV,
    "Peter Pan's Flight": PPF,
    'Princess Pavilion':PP,
    'Dumbo the Flying Elephant':DFE,
    "Le Passage Enchanté d'Aladdin":PEA,
    'Autopia®': autopia,
    'Le Carrousel de Lancelot ': Caroussel,
    'Les Mystères du Nautilus' :MN,
    'La Tanière du Dragon': TD,
    "Rustler Roundup Shootin' Gallery":RRSG,
    'Adventure Isle': AdventureIsle,
    'Welcome to Starport: A Star Wars Encounter': StartPort,
    "Blanche-Neige et les Sept Nains®": BlancheNeige,
    "Mickey’s PhilharMagic": MickeyPhil,
    'Pirates of the Caribbean': Pirates,
    '"it\'s a small world"': ISW,
    "Le Pays des Contes de Fées": PaysConte
};

function Homepage() {
    const [rawRideData, setRawRideData] = useState([]);
    const [filteredRideData, setFilteredRideData] = useState([]);
    const [closedRideData, setClosedRideData] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [
            {
                breakpoint: 1024, // Large desktop
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                },
            },
            {
                breakpoint: 768, // Tablet
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 480, // Mobile
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    // Utilisez le hook useInterval pour effectuer un appel API à intervalles réguliers
    useInterval(() => {
        fetchData();
    }, 60000); // Actualisez les données toutes les 60 secondes (ajustez selon vos besoins)

    const fetchData = async () => {
        try {
            const response = await axios.get(
                'https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/live'
            );
            const rideTimes = response.data;

            if (Array.isArray(rideTimes.liveData)) {
                console.log('Nouvelles données :', rideTimes.liveData);
                setRawRideData(rideTimes.liveData);
                setLastUpdate(new Date());
            } else {
                setRawRideData([]);
                setLastUpdate(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const openAttractions = rawRideData.filter(
            (ride) => ride.status === 'OPERATING' || (ride.status && ride.status === 'OPERATING')
        );
        const closedAttractions = rawRideData.filter(
            (ride) => ride.status === 'CLOSED' || (ride.status && ride.status == 'CLOSED')
        );
        const filteredAttractions = openAttractions.filter((ride) => ride.entityType !== 'SHOW');
        setClosedRideData(closedAttractions);
        setFilteredRideData(filteredAttractions);
    }, [rawRideData]);

    return (
        <div className="Home">
            <Navbar />
        <div className="container">
            <p className="lastUpdate">{lastUpdate ? `Dernière mise à jour : ${formatDate(lastUpdate)}` : 'Aucune mise à jour récente'}</p>
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
                    <h2>Ces attractions sont fermées:</h2>
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
        </div>
    );
}

const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
    return new Date(date).toLocaleDateString(undefined, options);
};

export default Homepage;
