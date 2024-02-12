const db = require('../Models/config/knexConfig');
const Joi = require('joi');

const getActivities = async () => {
    try {
        return await db
            .select('*')
            .from('activities')
            .where({
                is_deleted: false,
            })
        // .orderBy('titile', 'desc') // Assuming 'created_at' is the timestamp for when the accommodation was created
        // .limit(5);
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching activities');
    }
};

const getActivitiesByID = async (activities_id) => {
    try {
        return await db('activities')
            .select('*')
            .where({
                is_deleted: false,
                activities_id: activities_id
            });
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching activities by ID');
    }
};




const addActivities = async (activitiesData) => {
    try {

        return await db('activities')
            .insert(activitiesData)
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error adding activities');
    }
};

const updateActivities = async (activities_id, activitiesData) => {
    try {
        return await db('activities')
            .where({ activities_id: activities_id })
            .update(activitiesData)
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error updating activity');
    }
};

const markActivityAsDeleted = async (activities_id) => {
    try {
        return await db('activities')
            .where({ activities_id: activities_id })
            .update({ is_deleted: true });
    } catch (err) {
        console.error(err);
        throw new Error('Error marking activities as deleted');
    }
};


const addCommentToAc = async (activities_id, user_id, comment_text) => {
    try {
        const activitiesResult = await db('activities')
            .where({ activities_id: activities_id, is_deleted: false })
            .first();

        if (!activitiesResult) {
            throw new Error('activity not found or deleted');
        }

        const userResult = await db('users')
            .where({ user_id: user_id })
            .first();

        if (!userResult) {
            throw new Error('User not found');
        }

        return await db('comments')
            .insert({
                activities_id: activities_id,
                user_id: user_id,
                comment_text: comment_text
            })
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error adding comment');
    }
};
const getActivitiesWithComments = async (activities_id) => {
    try {
        return await db('activities')
            .where('activities.is_deleted', false)
            .where('activities.activities_id', activities_id)
            .join('comments', 'activities.activities_id', '=', 'comments.activities_id')
            .join('users', 'comments.user_id', '=', 'users.user_id')
            .select(
                'activities.activities_id',
                'comments.comment_id',
                'comments.comment_text',
                'comments.timestamp as comment_timestamp',
                'users.user_id',
                'users.first_name',
                'users.last_name'
            );
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching activities with comments');
    }
};

const getActivitiesPaginated = async (page, pageSize, search) => {
    try {
        if (page <= 0 || pageSize <= 0) {
            throw new Error("Invalid page or pageSize");
        }

        const offset = (page - 1) * pageSize;

        let query = db('activities')
            .orderBy('title', 'asc')
            .where('is_deleted', false)
            .limit(pageSize)
            .offset(offset);

        if (search) {
            query = query.whereRaw('LOWER(title) LIKE ?', `%${search.toLowerCase()}%`);
        }

        // Subquery to get total count
        const totalCountQuery = db('activities')
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


// Validation function
const validateUserInput = ({ address, phone }) => {
    const schema = Joi.object({
        address: Joi.string().min(3).max(15).required(),
        phone: Joi.string().pattern(/^[0-9]{10}$/).required()
    });

    const { error } = schema.validate({ address, phone });
    return error ? { error: error.details } : {};
};

const BookActivity = async (activities_id, cost, user_id, address, phone, adults, children, date_from, date_to) => {
    try {

        const validationError = validateUserInput({ address, phone });

        if (validationError.error) {
            return { error: validationError.error };
        }

        return await db('booking')
            .insert({
                cost,
                activities_id: activities_id,
                user_id: user_id,
                address: address,
                phone: phone,
                adults: adults,
                children: children,
                date_from: date_from,
                date_to: date_to,
                is_shown: true
            })
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error booking activity');
    }
};


module.exports = {
    getActivities,

    getActivitiesByID,

    addActivities,

    updateActivities,

    markActivityAsDeleted,

    addCommentToAc,

    getActivitiesWithComments,

    getActivitiesPaginated,

    BookActivity
};
