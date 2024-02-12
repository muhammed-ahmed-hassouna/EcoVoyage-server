// const db = require('./config/db');
const db = require('../Models/config/knexConfig');

const getDestinations = async () => {
    try {
        return await db
            .select('*')
            .from('destinations')
            .where({
                is_deleted: false,
            })
        // .orderBy('titile', 'desc') // Assuming 'created_at' is the timestamp for when the accommodation was created
        // .limit(5);
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching destinations');
    }
};

const getDestinationsByID = async (destinations_id) => {
    try {
        return await db('destinations')
            .select('*')
            .where({
                is_deleted: false,
                destinations_id: destinations_id
            });
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching destination by ID');
    }
};

const addDestinations = async (destinationData) => {
    try {
        return await db('destinations')
            .insert(destinationData)
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error adding destination');
    }
};

const updateDestinations = async (destinations_id, destinationData) => {
    try {
        return await db('destinations')
            .where({ destinations_id: destinations_id })
            .update(destinationData)
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error updating destination');
    }
};

const markDestinationsAsDeleted = async (destinations_id) => {
    const trx = await db.transaction();

    try {
        await trx('destinations')
            .where({ destinations_id: destinations_id })
            .update({ is_deleted: true });

        await trx('flights')
            .where({ destinations_id: destinations_id })
            .update({ is_deleted: true });

        await trx.commit();
    } catch (err) {
        await trx.rollback();
        console.error(err);
        throw new Error('Error marking destinations as deleted');
    }
};


const getDestinationsPaginated = async (page, pageSize, search) => {
    try {
        if (page <= 0 || pageSize <= 0) {
            throw new Error("Invalid page or pageSize");
        }

        const offset = (page - 1) * pageSize;

        let query = db('destinations')
            .orderBy('title', 'asc')
            .where('is_deleted', false)
            .limit(pageSize)
            .offset(offset);

        if (search) {
            query = query.whereRaw('LOWER(title) LIKE ?', `%${search.toLowerCase()}%`);
        }

        // Subquery to get total count
        const totalCountQuery = db('destinations')
            .count('* as count')
            .where('is_deleted', false);

        if (search) {
            totalCountQuery.whereRaw('LOWER(title) LIKE ?', `%${search.toLowerCase()}%`);
        }

        const totalCountResult = await totalCountQuery.first();

        return { data: await query, totalCount: totalCountResult.count };
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching paginated activities');
    }
};




module.exports = {

    getDestinations,

    getDestinationsByID,

    addDestinations,

    updateDestinations,

    markDestinationsAsDeleted,

    getDestinationsPaginated
};
