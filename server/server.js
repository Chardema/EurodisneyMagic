const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Ride = require('./models/Ride'); // Importez votre modèle de données Ride
const app = express();
const port = 5000;
const config = require('./config');

// Middleware pour gérer les requêtes JSON
app.use(express.json());


// Connexion à MongoDB Atlas
mongoose
    .connect(config.mongoURI)
    .then(() => {
        console.log('Connecté à MongoDB Atlas');
    })
    .catch((err) => {
        console.error('Erreur de connexion à MongoDB Atlas : ' + err);
    });

// Fonction pour supprimer les attractions obsolètes
const removeObsoleteAttractions = async () => {
    try {
        // Récupérez la liste des attractions obsolètes en fonction de votre nouveau schéma
        const obsoleteAttractions = await Ride.find({
            // Définissez les critères pour identifier les attractions obsolètes
            $or: [
                { entityType: { $ne: 'ATTRACTION' } }, // Exemple : Attractions non marquées comme "ATTRACTION"
                // Ajoutez d'autres critères ici si nécessaire
            ],
        });

        // Supprimez les attractions obsolètes
        for (const attraction of obsoleteAttractions) {
            await Ride.deleteOne({ _id: attraction._id });
        }

        console.log(`Attractions obsolètes supprimées : ${obsoleteAttractions.length}`);
    } catch (error) {
        console.error('Erreur lors de la suppression des attractions obsolètes : ' + error);
    }
};
removeObsoleteAttractions()
// Fonction pour récupérer les données depuis l'API externe et les stocker dans MongoDB
const fetchAndStoreParkData = async (parkUrl) => {
    try {
        const response = await axios.get(parkUrl);
        const rideTimes = response.data.liveData || [];

        // Parcourez les données de l'API et stockez-les dans MongoDB
        for (const rideData of rideTimes) {
            if (rideData.entityType === 'ATTRACTION') { // Vérifiez que l'attraction est de type "RIDE"
                await Ride.findOneAndUpdate(
                    { id: rideData.id }, // Utilisez le champ id pour rechercher l'attraction
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
                // Si l'attraction n'est pas de type "RIDE", supprimez-la de la base de données
                await Ride.deleteOne({ id: rideData.id });
            }
        }
        console.log('Données mises à jour dans MongoDB');
    } catch (error) {
        console.error('Erreur lors de la récupération et du stockage des données : ' + error);
    }
};
const fetchAndStoreData = async () => {
    await fetchAndStoreParkData('https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/live'); // Premier parc
    await fetchAndStoreParkData('https://api.themeparks.wiki/v1/entity/ca888437-ebb4-4d50-aed2-d227f7096968/live'); // Deuxième parc
};

// Exécutez la fonction de récupération et de stockage des données à intervalles réguliers
setInterval(fetchAndStoreData, 60000);

const cors = require('cors');
app.use(cors());
// Exemple de route pour récupérer toutes les attractions depuis MongoDB
app.get('/api/attractions', async (req, res) => {
    try {
        const attractions = await Ride.find();
        res.json(attractions);
    } catch (error) {
        console.error('Erreur lors de la récupération des attractions : ' + error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// Dans server.js



app.listen(port, () => {
    console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});

