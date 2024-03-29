export const setRawRideData = (data) => ({
    type: 'SET_RAW_RIDE_DATA',
    payload: data,
});

export const setFilteredRideData = (data) => ({
    type: 'SET_FILTERED_RIDE_DATA',
    payload: data,
});

export const setClosedRideData = (data) => ({
    type: 'SET_CLOSED_RIDE_DATA',
    payload: data,
});

export const setSearchTerm = (term) => ({
    type: 'SET_SEARCH_TERM',
    payload: term,
});
export const SET_ATTRACTIONS = 'SET_ATTRACTIONS';
export const SET_FAVORITES = 'SET_FAVORITES';
export const TOGGLE_FAVORITE = 'TOGGLE_FAVORITE';

export const setAttractions = (attractions) => {
    return {
        type: SET_ATTRACTIONS,
        payload: attractions,
    };
};

export const setFavorites = (favorites) => {
    return {
        type: SET_FAVORITES,
        payload: favorites, // Utilisez la nouvelle liste de favoris
    };
};

export const toggleFavorite = (attraction) => {
    return {
        type: TOGGLE_FAVORITE,
        payload: attraction,
    };
};

export const TOGGLE_FAVORITE_SHOW = 'TOGGLE_FAVORITE_SHOW';

// Exemple de fonction pour ajouter un spectacle aux favoris

export const toggleFavoriteShow = show => ({
    type: TOGGLE_FAVORITE_SHOW,
    payload: show,
});


