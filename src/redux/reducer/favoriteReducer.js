import { SET_FAVORITES, TOGGLE_FAVORITE, TOGGLE_FAVORITE_SHOW, SET_ATTRACTIONS } from '../actions';

const initialState = {
    favorites: [],
    attractions: [],
    shows: [], // Supposons que vous ayez une liste de spectacles similaire à celle des attractions
};

const favoritesReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_ATTRACTIONS:
            return {
                ...state,
                attractions: action.payload,
            };
        case TOGGLE_FAVORITE:
            const attraction = action.payload;
            const attractionExists = state.favorites.find(fav => fav.id === attraction.id);
            if (attractionExists) {
                return {
                    ...state,
                    favorites: state.favorites.filter(fav => fav.id !== attraction.id),
                };
            } else {
                const updatedAttraction = state.attractions.find(attr => attr.id === attraction.id) || attraction;
                return {
                    ...state,
                    favorites: [...state.favorites, updatedAttraction],
                };
            }
        case TOGGLE_FAVORITE_SHOW:
            const show = action.payload;
            const exists = state.favorites.some(fav => fav.id === show.id);
            if (exists) {
                // Supprimer le spectacle des favoris si déjà présent
                return {
                    ...state,
                    favorites: state.favorites.filter(fav => fav.id !== show.id),
                };
            } else {
                // Ajouter le spectacle aux favoris, en incluant tous les showtimes
                return {
                    ...state,
                    favorites: [...state.favorites, show],
                };
            }
        case SET_FAVORITES:
            return {
                ...state,
                favorites: action.payload,
            };
        default:
            return state;
    }
};

export default favoritesReducer;
