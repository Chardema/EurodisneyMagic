// store.js
// store.js
import { createStore, combineReducers } from 'redux';
import attractionsReducer from "./reducer/Attractionreducer";  // Assurez-vous que ce nom correspond à l'exportation par défaut de votre fichier reducer
import favoritesReducer from "./reducer/favoriteReducer";

const rootReducer = combineReducers({
    attractions: attractionsReducer,
    favorites: favoritesReducer,
});

const store = createStore(rootReducer);  // Utilisez rootReducer ici

export default store;
