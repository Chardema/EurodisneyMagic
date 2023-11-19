const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware pour gérer les requêtes JSON
app.use(express.json());
app.use(cors()); // Activation de CORS

// Configuration de la connexion MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
});

const port = process.env.PORT || 5000;
// Fonction pour supprimer les attractions obsolètes
const getAttractions = async () => {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM attractions');
        return rows;
    } catch (error) {
        console.error('Erreur lors de la récupération des attractions:', error);
        throw error;
    }
};


// Fonction pour récupérer les données depuis l'API externe et les stocker dans MongoDB
const fetchAndStoreParkData = async (parkUrl) => {
    try {
        const response = await axios.get(parkUrl);
        const rideTimes = response.data.liveData || [];

        for (const rideData of rideTimes) {
            if (rideData.entityType === 'ATTRACTION') {
                // Vérifiez si l'attraction existe déjà
                const [rows] = await pool.promise().query('SELECT id FROM attractions WHERE id = ?', [rideData.id]);

                if (rows.length > 0) {
                    // Mise à jour de l'attraction existante
                    await pool.promise().query(
                        'UPDATE attractions SET name = ?, status = ?, entityType = ?, standbyWaitTime = ?, parkId = ?, externalId = ?, lastUpdated = ? WHERE id = ?',
                        [
                            rideData.name,
                            rideData.status,
                            rideData.entityType,
                            rideData.queue?.STANDBY?.waitTime || null,
                            rideData.parkId,
                            rideData.externalId,
                            new Date(rideData.lastUpdated),
                            rideData.id
                        ]
                    );
                } else {
                    // Insertion d'une nouvelle attraction
                    await pool.promise().query(
                        'INSERT INTO attractions (id, name, status, entityType, standbyWaitTime, parkId, externalId, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            rideData.id,
                            rideData.name,
                            rideData.status,
                            rideData.entityType,
                            rideData.queue?.STANDBY?.waitTime || null,
                            rideData.parkId,
                            rideData.externalId,
                            new Date(rideData.lastUpdated)
                        ]
                    );
                }
            } else {
                // Supprimer l'attraction si elle n'est pas du type "ATTRACTION"
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
        const attractions = await getAttractions();
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
