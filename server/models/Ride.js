const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    id: String,
    name: String,
    status: String,
    entityType: String,
    queue: {
        STANDBY: {
            waitTime: Number
        }
    },
    parkId: String,
    externalId: String,
    lastUpdated: Date
});

module.exports = mongoose.model('Ride', rideSchema);

