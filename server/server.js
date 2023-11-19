const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const cors = require('cors');
const Ride = require('./models/Ride'); // Importez la classe Ride

const app = express();
app.use(express.json());
app.use(cors());

// Connexion à MongoDB Atlas
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connecté à MongoDB Atlas'))
    .catch(err => console.error('Erreur de connexion à MongoDB Atlas:', err));

// Fonction pour supprimer les attractions obsolètes
const removeObsoleteAttractions = async () => {
    try {
        const obsoleteAttractions = await Ride.find({
            $or: [{ entityType: { $ne: 'ATTRACTION' } }]
        });

const rideModel = new Ride(pool); // Instanciez la classe Ride avec le pool MySQL

const port = process.env.PORT || 5000;

// Fonction pour récupérer les données depuis l'API externe et les stocker dans MySQL
const fetchAndStoreParkData = async (parkUrl) => {
    try {
        const response = await axios.get(parkUrl);
        const rideTimes = response.data.liveData || [];

        for (const rideData of rideTimes) {
            if (rideData.entityType === 'ATTRACTION') {
                await rideModel.updateOrCreate(rideData);
            } else {
                // Supprimer l'attraction si elle n'est pas du type "ATTRACTION"
                // Cette logique peut être intégrée dans la classe Ride si nécessaire
                await pool.promise().query('DELETE FROM attractions WHERE id = ?', [rideData.id]);
            }
        }

        console.log('Données mises à jour dans MySQL');
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

// Route pour récupérer toutes les attractions depuis MySQL
app.get('/api/attractions', async (req, res) => {
    try {
        const attractions = await rideModel.getAll();
        res.json(attractions);
    } catch (error) {
        console.error('Erreur lors de la récupération des attractions:', error);
        res.status(500).send('Erreur serveur');
    }
});
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
