class Ride {
    constructor(pool) {
        this.pool = pool;
    }

    async getAll() {
        try {
            const [rows] = await this.pool.promise().query('SELECT * FROM attractions');
            return rows;
        } catch (error) {
            console.error('Erreur lors de la récupération des attractions:', error);
            throw error;
        }
    }

    async updateOrCreate(rideData) {
        try {
            const [rows] = await this.pool.promise().query('SELECT id FROM attractions WHERE id = ?', [rideData.id]);
            if (rows.length > 0) {
                await this.pool.promise().query(
                    'UPDATE attractions SET name = ?, status = ?, entityType = ?, standbyWaitTime = ?, parkId = ?, externalId = ?, lastUpdated = ? WHERE id = ?',
                    [
                        rideData.name,
                        rideData.status,
                        rideData.entityType,
                        rideData.queue?.STANDBY?.waitTime || null,
                        rideData.parkId,
                        rideData.externalId,
                        new Date(rideData.lastUpdated),
                        rideData.id
                    ]
                );
            } else {
                await this.pool.promise().query(
                    'INSERT INTO attractions (id, name, status, entityType, standbyWaitTime, parkId, externalId, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        rideData.id,
                        rideData.name,
                        rideData.status,
                        rideData.entityType,
                        rideData.queue?.STANDBY?.waitTime || null,
                        rideData.parkId,
                        rideData.externalId,
                        new Date(rideData.lastUpdated)
                    ]
                );
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour ou de la création d’une attraction:', error);
            throw error;
        }
    }
}

module.exports = Ride;
