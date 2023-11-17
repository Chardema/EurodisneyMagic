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
