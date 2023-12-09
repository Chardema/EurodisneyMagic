import { SET_ATTRACTIONS } from '../actions';
const initialState = {
    rawRideData: [],
    filteredRideData: [],
    closedRideData: [],
    searchTerm: '',
    attractions: [],
};

const yourReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_RAW_RIDE_DATA':
            return {
                ...state,
                rawRideData: action.payload,
            };
        case 'SET_FILTERED_RIDE_DATA':
            return {
                ...state,
                filteredRideData: action.payload,
            };
        case 'SET_CLOSED_RIDE_DATA':
            return {
                ...state,
                closedRideData: action.payload,
            };
        case 'SET_SEARCH_TERM':
            return {
                ...state,
                searchTerm: action.payload,
            };
        case SET_ATTRACTIONS:
            return {
                ...state,
                attractions: action.payload,
            };
        default:
            return state;
    }
};

export default yourReducer;
