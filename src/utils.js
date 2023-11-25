import { useState, useEffect } from 'react';
export const formatDate = (dateString) => {
    if (!dateString) return 'Date invalide';

    try {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
    } catch (error) {
        console.error("Erreur de formatage de date:", error, "pour la date:", dateString);
        return 'Date invalide';
    }
};


export const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
};
export const formatImageName = (name) => {
    return name
            .replace(/®/g, '') // Supprime le symbole ®
            .replace(/™/g, '') // Supprime le symbole ™
            .replace(/:/g, '') // Supprime les deux-points
            .replace(/é/g, 'e') // Remplace é par e
            .replace(/è/g, 'e') // Remplace è par e
            .replace(/'/g, '') // Remplace è par e
            // Ajoutez ici d'autres remplacements si nécessaire
            .replace(/[^a-zA-Z0-9]/g, '') // Supprime les autres caractères non alphanumériques
        + '.jpg';
};
export const formatTime = (dateString) => {
    if (!dateString) return 'Heure invalide';

    try {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
    } catch (error) {
        console.error("Erreur de formatage de l'heure:", error, "pour la date:", dateString);
        return 'Heure invalide';
    }
};

export const importImage = (imageName) => {
    try {
        return require(`.//img/${imageName}`);
    } catch (err) {
        console.error(err);
        // Retourne une image par défaut en cas d'erreur
        return require(`.//img/default.jpg`);
    }
};
