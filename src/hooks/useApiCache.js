import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// Cache global pour partager entre tous les composants
const apiCache = new Map();
const cacheTimestamps = new Map();
const pendingRequests = new Map();

/**
 * Hook personnalisé pour les appels API avec cache intelligent
 * @param {string} url - L'URL de l'API à appeler
 * @param {Object} options - Options de configuration
 * @param {number} options.cacheDuration - Durée du cache en millisecondes (défaut: 2 minutes)
 * @param {boolean} options.enabled - Si false, la requête ne sera pas exécutée
 * @param {Array} options.dependencies - Dépendances pour re-fetcher
 * @returns {Object} - { data, loading, error, refetch, isCached }
 */
const useApiCache = (url, options = {}) => {
    const {
        cacheDuration = 2 * 60 * 1000, // 2 minutes par défaut
        enabled = true,
        dependencies = []
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCached, setIsCached] = useState(false);
    const mountedRef = useRef(true);

    // Vérifier si les données en cache sont encore valides
    const isCacheValid = useCallback((key) => {
        if (!apiCache.has(key)) return false;

        const cacheTime = cacheTimestamps.get(key);
        if (!cacheTime) return false;

        const now = Date.now();
        return (now - cacheTime) < cacheDuration;
    }, [cacheDuration]);

    // Fonction pour récupérer les données
    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        try {
            // Vérifier le cache d'abord (sauf si forceRefresh)
            if (!forceRefresh && isCacheValid(url)) {
                const cachedData = apiCache.get(url);
                if (mountedRef.current) {
                    setData(cachedData);
                    setLoading(false);
                    setIsCached(true);
                    setError(null);
                }
                return cachedData;
            }

            // Vérifier si une requête est déjà en cours pour cette URL
            if (pendingRequests.has(url)) {
                const result = await pendingRequests.get(url);
                if (mountedRef.current) {
                    setData(result);
                    setLoading(false);
                    setIsCached(false);
                }
                return result;
            }

            // Créer une nouvelle requête
            if (mountedRef.current) {
                setLoading(true);
                setError(null);
                setIsCached(false);
            }

            const requestPromise = axios.get(url);
            pendingRequests.set(url, requestPromise);

            const response = await requestPromise;
            const responseData = response.data;

            // Mettre en cache
            apiCache.set(url, responseData);
            cacheTimestamps.set(url, Date.now());
            pendingRequests.delete(url);

            if (mountedRef.current) {
                setData(responseData);
                setLoading(false);
                setError(null);
            }

            return responseData;

        } catch (err) {
            pendingRequests.delete(url);

            if (mountedRef.current) {
                setError(err);
                setLoading(false);

                // Si on a des données en cache (même expirées), les utiliser en fallback
                if (apiCache.has(url)) {
                    setData(apiCache.get(url));
                    setIsCached(true);
                    console.warn(`Erreur API, utilisation du cache pour ${url}:`, err.message);
                }
            }
        }
    }, [url, enabled, isCacheValid]);

    // Fonction pour forcer un refresh
    const refetch = useCallback(() => {
        return fetchData(true);
    }, [fetchData]);

    // Fonction pour invalider le cache
    const invalidateCache = useCallback(() => {
        apiCache.delete(url);
        cacheTimestamps.delete(url);
    }, [url]);

    // Effet pour charger les données
    useEffect(() => {
        mountedRef.current = true;
        fetchData();

        return () => {
            mountedRef.current = false;
        };
    }, [url, enabled, ...dependencies]);

    // Nettoyer le cache régulièrement (toutes les 10 minutes)
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, timestamp] of cacheTimestamps.entries()) {
                if (now - timestamp > 10 * 60 * 1000) { // 10 minutes
                    apiCache.delete(key);
                    cacheTimestamps.delete(key);
                }
            }
        }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes

        return () => clearInterval(cleanupInterval);
    }, []);

    return {
        data,
        loading,
        error,
        refetch,
        invalidateCache,
        isCached
    };
};

// Fonction utilitaire pour invalider tout le cache
export const clearAllCache = () => {
    apiCache.clear();
    cacheTimestamps.clear();
    pendingRequests.clear();
};

// Fonction utilitaire pour pré-charger des données dans le cache
export const prefetchData = async (url) => {
    if (!pendingRequests.has(url)) {
        try {
            const response = await axios.get(url);
            apiCache.set(url, response.data);
            cacheTimestamps.set(url, Date.now());
            return response.data;
        } catch (error) {
            console.error(`Erreur lors du prefetch de ${url}:`, error);
            return null;
        }
    }
};

export default useApiCache;
