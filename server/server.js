const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Ride = require('./models/Ride'); // Importez votre modèle de données Ride
const cors = require('cors');
const app = express();
require('dotenv').config();
const mongoURL = process.env.MONGO_URL

// Utilisation du port fourni par l'environnement pour Azure, sinon 5000
const port = process.env.PORT || 5000;

// Middleware pour gérer les requêtes JSON
app.use(express.json());
app.use(cors()); // Activation de CORS

// Connexion à MongoDB Atlas
mongoose.connect(mongoURL)
    .then(() => console.log('Connecté à MongoDB Atlas'))
    .catch(err => console.error('Erreur de connexion à MongoDB Atlas:', err));

// Fonction pour supprimer les attractions obsolètes
const removeObsoleteAttractions = async () => {
    try {
        const obsoleteAttractions = await Ride.find({
            $or: [{ entityType: { $ne: 'ATTRACTION' } }]
        });

        for (const attraction of obsoleteAttractions) {
            await Ride.deleteOne({ _id: attraction._id });
        }

        console.log(`Attractions obsolètes supprimées : ${obsoleteAttractions.length}`);
    } catch (error) {
        console.error('Erreur lors de la suppression des attractions obsolètes:', error);
    }
};
removeObsoleteAttractions();

// Fonction pour récupérer les données depuis l'API externe et les stocker dans MongoDB
const fetchAndStoreParkData = async (parkUrl) => {
    try {
        const response = await axios.get(parkUrl);
        const rideTimes = response.data.liveData || [];

        for (const rideData of rideTimes) {
            if (rideData.entityType === 'ATTRACTION') {
                await Ride.findOneAndUpdate(
                    { id: rideData.id },
                    {
                        id: rideData.id,
                        name: rideData.name,
                        status: rideData.status,
                        entityType: rideData.entityType,
                        queue: {
                            STANDBY: {
                                waitTime: rideData.queue?.STANDBY?.waitTime || null
                            }
                        },
                        parkId: rideData.parkId,
                        externalId: rideData.externalId,
                        lastUpdated: new Date(rideData.lastUpdated)
                    },
                    { upsert: true }
                );
            } else {
                await Ride.deleteOne({ id: rideData.id });
            }
        }

        console.log('Données mises à jour dans MongoDB');
    } catch (error) {
        console.error('Erreur lors de la récupération et du stockage des données:', error);
    }
};

const fetchAndStoreData = async () => {
    await fetchAndStoreParkData('https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/live');
    await fetchAndStoreParkData('https://api.themeparks.wiki/v1/entity/ca888437-ebb4-4d50-aed2-d227f7096968/live');
};

// Exécutez la fonction de récupération et de stockage des données à intervalles réguliers
setInterval(fetchAndStoreData, 60000);

// Route pour récupérer toutes les attractions depuis MongoDB
app.get('/api/attractions', async (req, res) => {
    try {
        const attractions = await Ride.find();
        res.json(attractions);
    } catch (error) {
        console.error('Erreur lors de la récupération des attractions:', error);
        res.status(500).send('Erreur serveur');
    }
});
// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
