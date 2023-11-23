// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const Ride = require('./models/Ride');
const Show = require('./models/Show'); // Importez le nouveau modèle Show

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

const port = process.env.PORT || 5000;

const fetchAndStoreData = async () => {
    const disneylandUrl = 'https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/live';
    const studiosUrl = 'https://api.themeparks.wiki/v1/entity/ca888437-ebb4-4d50-aed2-d227f7096968/live';

    try {
        const [disneylandResponse, studiosResponse] = await Promise.all([
            axios.get(disneylandUrl),
            axios.get(studiosUrl)
        ]);

        const disneylandEntities = disneylandResponse.data.liveData;
        const studiosEntities = studiosResponse.data.liveData;

        const allAttractions = [...disneylandEntities, ...studiosEntities].filter(entity => entity.entityType === 'ATTRACTION');
        const allShows = [...disneylandEntities, ...studiosEntities].filter(entity => entity.entityType === 'SHOW');

        for (const attraction of allAttractions) {
            await Ride.updateOrCreate(attraction);
        }

        for (const show of allShows) {
            await Show.updateOrCreate(show);
        }

        console.log('Mise à jour des attractions et des shows de Disneyland et des studios effectuée.');
    } catch (error) {
        console.error('Erreur lors de la récupération et du stockage des données:', error);
    }
};


setInterval(fetchAndStoreData, 60000);

app.get('/api/attractions', async (req, res) => {
    try {
        const attractions = await Ride.getAll();
        res.json(attractions);
    } catch (error) {
        console.error('Erreur lors de la récupération des attractions:', error);
        res.status(500).send('Erreur serveur');
    }
});
app.get('/api/shows', async (req, res) => {
    try {
        const shows = await Show.getAll();
        res.json(shows);
    } catch (error) {
        console.error('Erreur lors de la récupération des shows:', error);
        res.status(500).send('Erreur serveur');
    }
});

app.get('/', (req, res) => {
    res.send('Page d’accueil');
});

app.listen(port, () => {
    console.log(`Serveur Express en cours d'exécution sur le port ${port}`);
});
