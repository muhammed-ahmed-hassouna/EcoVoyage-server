const db = require('../Models/config/knexConfig');
// const db = require('../Models/config/db');

const getAccommodations = async () => {
    try {
        return await db
            .select('*')
            .from('accommodation')
            .where({
                is_deleted: false,
            })
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching accommodations');
    }
};

const getAccommodationsByID = async (accommodation_id) => {
    try {
        return await db('accommodation')
            .select('*')
            .where({
                is_deleted: false,
                accommodation_id: accommodation_id
            });
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching accommodation by ID');
    }
};

const addAccommodation = async (accommodationData) => {
    try {
        return await db('accommodation')
            .insert(accommodationData)
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error adding accommodation');
    }
};

const updateAccommodation = async (accommodation_id, accommodationData) => {
    try {
        return await db('accommodation')
            .where({ accommodation_id: accommodation_id })
            .update(accommodationData)
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error updating accommodation');
    }
};

const markAccommodationAsDeleted = async (accommodation_id) => {
    try {
        return await db('accommodation')
            .where({ accommodation_id: accommodation_id })
            .update({ is_deleted: true });
    } catch (err) {
        console.error(err);
        throw new Error('Error marking accommodation as deleted');
    }
};


const addComment = async (accommodation_id, user_id, comment_text) => {
    try {
        const accommodationResult = await db('accommodation')
            .where({ accommodation_id: accommodation_id, is_deleted: false })
            .first();

        if (!accommodationResult) {
            throw new Error('Accommodation not found or deleted');
        }

        const userResult = await db('users')
            .where({ user_id: user_id })
            .first();

        if (!userResult) {
            throw new Error('User not found');
        }

        return await db('comments')
            .insert({
                accommodation_id: accommodation_id,
                user_id: user_id,
                comment_text: comment_text
            })
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error adding comment');
    }
};
const getAccommodationsWithComments = async (accommodation_id) => {
    try {
        return await db('accommodation')
            .where('accommodation.is_deleted', false)
            .where('accommodation.accommodation_id', accommodation_id)
            .join('comments', 'accommodation.accommodation_id', '=', 'comments.accommodation_id')
            .join('users', 'comments.user_id', '=', 'users.user_id')
            .select(
                'accommodation.accommodation_id',
                'comments.comment_id',
                'comments.comment_text',
                'comments.timestamp as comment_timestamp',
                'users.user_id',
                'users.first_name',
                'users.last_name'
            );
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching accommodations with comments');
    }
};

const bookAccommodation = async (accommodation_id, cost, user_id, address, phone, adults, children, date_from, date_to) => {
    try {
        return await db('booking')
            .insert({
                cost: cost,
                accommodation_id: accommodation_id,
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
        throw new Error('Error booking accommodation');
    }
};

const CancelBookAccomm = async (book_id) => {
    try {
        return await db('booking')
            .where({ book_id: book_id })
            .update({ is_shown: false })
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error booking accommodation');
    }
};

const getBookAccommodations = async (accommodation_id) => {
    try {
        return await db('accommodation')
            .where('accommodation.is_deleted', false)
            .where('accommodation.accommodation_id', accommodation_id)
            .join('booking', 'accommodation.accommodation_id', '=', 'booking.accommodation_id')
            .join('users', 'booking.user_id', '=', 'users.user_id')
            .select(
                'accommodation.accommodation_id',
                'booking.book_id',
                'booking.phone',
                // 'booking.room_preference',
                'booking.adults',
                'booking.children',
                'users.user_id',
                'users.first_name',
                'users.last_name'
            );
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching booked accommodations');
    }
};

const getAccommodationsPaginated = async (page, pageSize, search) => {
    try {
        if (page <= 0 || pageSize <= 0) {
            throw new Error("Invalid page or pageSize");
        }

        const offset = (page - 1) * pageSize;

        let query = db('accommodation')
            .where('accommodation.is_deleted', false)
            .orderBy('accommodation_id', 'desc')
            .limit(pageSize)
            .offset(offset);

        if (search) {
            query = query.whereRaw('LOWER(title) LIKE ?', `%${search.toLowerCase()}%`);
        }


        // Subquery to get total count
        const totalCountQuery = db('accommodation')
            .count('* as count')
            .where('accommodation.is_deleted', false);

        if (search) {
            totalCountQuery.whereRaw('LOWER(title) LIKE ?', `%${search.toLowerCase()}%`);
        }

        const totalCountResult = await totalCountQuery.first();

        return { data: await query, totalCount: totalCountResult.count };
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching paginated accommodations');
    }
};



module.exports = {

    getAccommodations,

    getAccommodationsByID,

    addAccommodation,

    updateAccommodation,

    markAccommodationAsDeleted,

    addComment,

    getAccommodationsWithComments,

    bookAccommodation,

    getBookAccommodations,

    // getBookByIdQuery,

    getAccommodationsPaginated,

    CancelBookAccomm

};
