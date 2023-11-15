// store.js
import { createStore } from 'redux';
import Attractionreducer from "./reducer/Attractionreducer";

const store = createStore(Attractionreducer);

export default store;
