const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

// Cache en mémoire pour améliorer les performances
let attractionsCache = {
    data: [],
    lastUpdate: null,
    cacheTimeout: 2 * 60 * 1000 // 2 minutes de cache
};

let showsCache = {
    data: [],
    lastUpdate: null,
    cacheTimeout: 5 * 60 * 1000 // 5 minutes de cache pour les spectacles
};

// Stockage en mémoire des temps d'attente historiques
let waitTimesHistory = [];
const MAX_HISTORY_ENTRIES = 100000; // Limite pour éviter la saturation mémoire

// URLs des parcs Disneyland Paris
const PARK_URLS = {
    disneylandPark: 'https://api.themeparks.wiki/v1/entity/dae968d5-630d-4719-8b06-3d107e944401/live',
    waltDisneyStudios: 'https://api.themeparks.wiki/v1/entity/ca888437-ebb4-4d50-aed2-d227f7096968/live'
};

// Fonction pour récupérer et combiner les données des deux parcs
const fetchParkData = async () => {
    try {
        const [disneylandResponse, studiosResponse] = await Promise.all([
            axios.get(PARK_URLS.disneylandPark),
            axios.get(PARK_URLS.waltDisneyStudios)
        ]);

        const disneylandData = disneylandResponse.data.liveData || [];
        const studiosData = studiosResponse.data.liveData || [];

        // Combiner et filtrer les attractions uniquement
        const allAttractions = [...disneylandData, ...studiosData]
            .filter(item => item.entityType === 'ATTRACTION')
            .map(attraction => ({
                ...attraction,
                park: disneylandData.includes(attraction) ? 'Disneyland Park' : 'Walt Disney Studios',
                lastUpdated: new Date().toISOString()
            }));

        return allAttractions;
    } catch (error) {
        console.error('Erreur lors de la récupération des données des parcs:', error.message);
        return attractionsCache.data; // Retourner le cache en cas d'erreur
    }
};

// Fonction pour récupérer les spectacles
const fetchShowsData = async () => {
    try {
        const [disneylandResponse, studiosResponse] = await Promise.all([
            axios.get(PARK_URLS.disneylandPark),
            axios.get(PARK_URLS.waltDisneyStudios)
        ]);

        const disneylandData = disneylandResponse.data.liveData || [];
        const studiosData = studiosResponse.data.liveData || [];

        // Filtrer les spectacles uniquement
        const allShows = [...disneylandData, ...studiosData]
            .filter(item => item.entityType === 'SHOW')
            .map(show => ({
                ...show,
                park: disneylandData.includes(show) ? 'Disneyland Park' : 'Walt Disney Studios',
                lastUpdated: new Date().toISOString()
            }));

        return allShows;
    } catch (error) {
        console.error('Erreur lors de la récupération des spectacles:', error.message);
        return showsCache.data; // Retourner le cache en cas d'erreur
    }
};

// Mettre à jour le cache des attractions
const updateAttractionsCache = async () => {
    const data = await fetchParkData();
    attractionsCache = {
        data,
        lastUpdate: Date.now()
    };
    console.log(`✨ Cache attractions mis à jour: ${data.length} attractions`);
};

// Mettre à jour le cache des spectacles
const updateShowsCache = async () => {
    const data = await fetchShowsData();
    showsCache = {
        data,
        lastUpdate: Date.now()
    };
    console.log(`🎭 Cache spectacles mis à jour: ${data.length} spectacles`);
};

// Initialisation du cache au démarrage
updateAttractionsCache();
updateShowsCache();

// Mise à jour périodique des caches
setInterval(updateAttractionsCache, 2 * 60 * 1000); // Toutes les 2 minutes
setInterval(updateShowsCache, 5 * 60 * 1000); // Toutes les 5 minutes

// Route pour récupérer toutes les attractions (avec cache)
app.get('/api/attractions', async (req, res) => {
    try {
        // Vérifier si le cache est encore valide
        const cacheAge = Date.now() - attractionsCache.lastUpdate;
        if (cacheAge > attractionsCache.cacheTimeout) {
            await updateAttractionsCache();
        }

        res.json(attractionsCache.data);
    } catch (error) {
        console.error('Erreur lors de la récupération des attractions:', error);
        res.status(500).json({ error: 'Erreur serveur', message: error.message });
    }
});

// Route pour récupérer tous les spectacles (avec cache)
app.get('/api/shows', async (req, res) => {
    try {
        // Vérifier si le cache est encore valide
        const cacheAge = Date.now() - showsCache.lastUpdate;
        if (cacheAge > showsCache.cacheTimeout) {
            await updateShowsCache();
        }

        res.json(showsCache.data);
    } catch (error) {
        console.error('Erreur lors de la récupération des spectacles:', error);
        res.status(500).json({ error: 'Erreur serveur', message: error.message });
    }
});

// Route pour enregistrer les temps d'attente (historique)
app.post('/api/wait-times', async (req, res) => {
    try {
        const waitTimeData = {
            ...req.body,
            timestamp: new Date().toISOString()
        };

        waitTimesHistory.push(waitTimeData);

        // Limiter la taille de l'historique
        if (waitTimesHistory.length > MAX_HISTORY_ENTRIES) {
            waitTimesHistory = waitTimesHistory.slice(-MAX_HISTORY_ENTRIES);
        }

        res.json({ success: true, message: 'Temps d\'attente enregistré' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du temps d\'attente:', error);
        res.status(500).json({ error: 'Erreur serveur', message: error.message });
    }
});

// Route pour récupérer les temps d'attente moyens par période
app.get('/api/wait-times/average-period/:attractionId', async (req, res) => {
    try {
        const { attractionId } = req.params;

        // Filtrer l'historique pour cette attraction
        const attractionHistory = waitTimesHistory.filter(entry =>
            entry.id === attractionId || entry.attractionId === attractionId
        );

        if (attractionHistory.length === 0) {
            return res.json({
                morning: { average: null, count: 0 },
                afternoon: { average: null, count: 0 },
                evening: { average: null, count: 0 }
            });
        }

        // Calculer les moyennes par période
        const periods = {
            morning: [], // 9h-12h
            afternoon: [], // 12h-18h
            evening: [] // 18h-23h
        };

        attractionHistory.forEach(entry => {
            const date = new Date(entry.timestamp);
            const hour = date.getHours();
            const waitTime = entry.waitTime || entry.queue?.STANDBY?.waitTime;

            if (waitTime && waitTime > 0) {
                if (hour >= 9 && hour < 12) {
                    periods.morning.push(waitTime);
                } else if (hour >= 12 && hour < 18) {
                    periods.afternoon.push(waitTime);
                } else if (hour >= 18 && hour < 23) {
                    periods.evening.push(waitTime);
                }
            }
        });

        // Calculer les moyennes
        const result = {
            morning: {
                average: periods.morning.length > 0
                    ? Math.round(periods.morning.reduce((a, b) => a + b, 0) / periods.morning.length)
                    : null,
                count: periods.morning.length
            },
            afternoon: {
                average: periods.afternoon.length > 0
                    ? Math.round(periods.afternoon.reduce((a, b) => a + b, 0) / periods.afternoon.length)
                    : null,
                count: periods.afternoon.length
            },
            evening: {
                average: periods.evening.length > 0
                    ? Math.round(periods.evening.reduce((a, b) => a + b, 0) / periods.evening.length)
                    : null,
                count: periods.evening.length
            }
        };

        res.json(result);
    } catch (error) {
        console.error('Erreur lors du calcul des moyennes:', error);
        res.status(500).json({ error: 'Erreur serveur', message: error.message });
    }
});

// Route pour obtenir les statistiques globales
app.get('/api/stats', (req, res) => {
    try {
        res.json({
            attractionsCount: attractionsCache.data.length,
            showsCount: showsCache.data.length,
            historyEntries: waitTimesHistory.length,
            lastUpdate: attractionsCache.lastUpdate,
            cacheAge: Date.now() - attractionsCache.lastUpdate
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error);
        res.status(500).json({ error: 'Erreur serveur', message: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Servir les fichiers statiques du build React
app.use(express.static(path.join(__dirname, '../build')));

// Toutes les autres routes retournent l'application React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`🎢 Serveur EuroDisney Magic démarré sur le port ${port}`);
    console.log(`🏰 API disponible sur http://localhost:${port}/api`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
    console.error('Erreur non gérée:', error);
});
