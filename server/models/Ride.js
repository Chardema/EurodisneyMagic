// Ride.js
const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    id: String,
    name: String,
    status: String,
    parkId: String,
    externalId: String,
    lastUpdated: Date,
    waitTime: Number
});

rideSchema.statics.updateOrCreate = async function (rideData) {
    const ride = await this.findOne({ id: rideData.id });
    if (ride) {
        ride.set({
            name: rideData.name,
            status: rideData.status,
            parkId: rideData.parkId,
            externalId: rideData.externalId,
            lastUpdated: new Date(rideData.lastUpdated),
            waitTime: rideData.queue?.STANDBY?.waitTime || null
        });
        await ride.save();
    } else {
        await this.create({
            id: rideData.id,
            name: rideData.name,
            status: rideData.status,
            parkId: rideData.parkId,
            externalId: rideData.externalId,
            lastUpdated: new Date(rideData.lastUpdated),
            waitTime: rideData.queue?.STANDBY?.waitTime || null
        });
    }
};

rideSchema.statics.getAll = async function () {
    return await this.find({});
};

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
