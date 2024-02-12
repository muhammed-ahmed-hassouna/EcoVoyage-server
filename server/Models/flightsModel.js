const db = require('../Models/config/knexConfig');

const addFlight = async (flightsData) => {
    try {
        return await db('flights')
            .insert(flightsData)
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error adding Flights');
    }
};

const getFlights = async () => {
    try {
        const flights = await db
            .select('flights.*', 'destinations.country as destination_name')
            .from('flights')
            .where({
                'flights.is_deleted': false,
                'flights.available': true
            })
            .join('destinations', 'flights.destinations_id', 'destinations.destinations_id');

        return flights;
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching Flights');
    }
};

const getFlightsByID = async (flights_id) => {
    try {
        return await db('flights')
            .select('flights.*', 'destinations.country as destination_name')
            .where({
                'flights.is_deleted': false,
                'flights.flights_id': flights_id
            })
            .join('destinations', 'flights.destinations_id', 'destinations.destinations_id');

    } catch (err) {
        console.error(err);
        throw new Error('Error fetching destination by ID');
    }
};


const softDeleteFlights = async (flights_id) => {
    try {
        return await db('flights')
            .where({ flights_id: flights_id })
            .update({ is_deleted: true });
    } catch (err) {
        console.error(err);
        throw new Error('Error marking accommodation as deleted');
    }
};


const updateFlight = async (flights_id, flightsData) => {
    try {
        return await db('flights')
            .where({ flights_id: flights_id })
            .update(flightsData)
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error updating Flight');
    }
};

const getFlightsPaginated = async (page, pageSize, search) => {
    try {
        if (page <= 0 || pageSize <= 0) {
            throw new Error("Invalid page or pageSize");
        }

        const offset = (page - 1) * pageSize;

        let query = db('flights')
            .select('flights.*', 'destinations.country as destination_name')
            .orderBy('destinations.title', 'asc') // Use the actual column name instead of the alias
            .limit(pageSize)
            .offset(offset)
            .join('destinations', 'flights.destinations_id', 'destinations.destinations_id');


        if (search) {
            query = query.whereRaw('LOWER(destinations.title) LIKE ?', `%${search.toLowerCase()}%`);
        }

        const totalCountQuery = db('flights')
            .count('* as count')
            .join('destinations', 'flights.destinations_id', 'destinations.destinations_id');

        if (search) {
            totalCountQuery.whereRaw('LOWER(destinations.title) LIKE ?', `%${search.toLowerCase()}%`);
        }

        const totalCountResult = await totalCountQuery.first();

        return { data: await query, totalCount: totalCountResult.count };
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching paginated activities');
    }
};

module.exports = {
    addFlight,

    getFlights,

    softDeleteFlights,

    updateFlight,

    getFlightsPaginated,

    getFlightsByID
}