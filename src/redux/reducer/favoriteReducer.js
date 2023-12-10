import { SET_FAVORITES, TOGGLE_FAVORITE, SET_ATTRACTIONS } from '../actions';

const initialState = {
    favorites: [],
    attractions: [],
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
            const exists = state.favorites.find(fav => fav.id === attraction.id);
            if (exists) {
                // Retirer des favoris
                return {
                    ...state,
                    favorites: state.favorites.filter(fav => fav.id !== attraction.id),
                };
            } else {
                // Ajouter aux favoris avec des informations à jour
                const updatedAttraction = state.attractions.find(attr => attr.id === attraction.id) || attraction;
                return {
                    ...state,
                    favorites: [...state.favorites, updatedAttraction],
                };
            }
        case SET_FAVORITES:
            // Mettre à jour la liste des favoris avec la nouvelle liste
            return {
                ...state,
                favorites: action.payload,
            };
        // Autres cas...
        default:
            return state;
    }
};

export default favoritesReducer;
