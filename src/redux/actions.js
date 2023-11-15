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

