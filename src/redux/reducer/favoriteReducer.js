import {SET_FAVORITES, TOGGLE_FAVORITE} from '../actions';

const initialState = {
    favorites: [],
    attractions: [],
};

const favoritesReducer = (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_FAVORITE:
            const attraction = action.payload;
            const exists = state.favorites.find(fav => fav.id === attraction.id);
            if (exists) {
                return {
                    ...state,
                    favorites: state.favorites.filter(fav => fav.id !== attraction.id),
                };
            } else {
                return {
                    ...state,
                    favorites: [...state.favorites, attraction],
                };
            }
        case SET_FAVORITES:
            return {
                ...state,
                favorites: action.payload, // Mettez à jour la liste des favoris avec la nouvelle liste
            };
        // Autres cas...
        default:
            return state;
    }
};



export default favoritesReducer;
