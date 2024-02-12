const db = require('../Models/config/knexConfig');

const Joi = require('joi');

const getTickets = async () => {
    try {
        return await db
            .select('*')
            .from('ticketbooking')
            .where({
                is_deleted: false,
            })
        // .orderBy('titile', 'desc') // Assuming 'created_at' is the timestamp for when the accommodation was created
        // .limit(5);
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching Tickets');
    }
};

const getTicketByID = async (ticket_id) => {
    try {
        return await db('ticketbooking')
            .select('*')
            .where({
                is_deleted: false,
                ticket_id: ticket_id
            });
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching Ticket by ID');
    }
};



// Validation function
const validateUserInput = ({ first_name, last_name, phone_number, bag_details, dateof_birth }) => {
    const schema = Joi.object({
        first_name: Joi.string().min(3).max(15).required(),
        last_name: Joi.string().min(3).max(15).required(),
        phone_number: Joi.string().pattern(/^[0-9]{10}$/).required(),
        bag_details:Joi.required(),
        dateof_birth:Joi.required(),
    });

    const { error } = schema.validate({ first_name, last_name, phone_number, bag_details, dateof_birth });
    return error ? { error: error.details } : {};
};

const addTicket = async (ticketData, user_id) => {
    const transaction = await db.transaction();

    try {
        const validationError = validateUserInput(ticketData);

        if (validationError.error) {
            return { error: validationError.error };
        }

        const userResult = await db('users')
            .where({ user_id: user_id })
            .first();

        if (!userResult) {
            throw new Error('User not found');
        }

        // Determine the column to decrement based on ticket_type
        let columnToDecrement;
        switch (ticketData.ticket_type) {
            case 'business':
                columnToDecrement = 'business';
                break;
            case 'economy':
                columnToDecrement = 'economy';
                break;
            case 'first':
                columnToDecrement = 'first';
                break;
            default:
                throw new Error('Invalid ticket_type');
        }

        const flightId = ticketData.flights_id; // Assuming flight_id is present in ticketData
        // Check if the value for the specified type is greater than zero before decrementing
        const currentCount = await transaction('flights')
            .where('flights_id', flightId)
            .select(columnToDecrement, 'available')
            .first();

        if (currentCount && currentCount[columnToDecrement] > 0) {
            // Decrement the corresponding column in the flights table based on flight_id
            await transaction('flights')
                .where('flights_id', flightId)
                .decrement(columnToDecrement, 1);

            // Insert the ticket into the ticketbooking table
            const insertedTicket = await transaction('ticketbooking')
                .insert({ ...ticketData, user_id: user_id, is_shown: true })
                .returning('*');

            const currentCounts = await transaction('flights')
                .where('flights_id', flightId)
                .select('business', 'economy', 'first', 'available')
                .first();

            // Check if all types are now zero and update the 'available' column
            const allTypesZero =
                currentCounts.business === 0 &&
                currentCounts.economy === 0 &&
                currentCounts.first === 0;
            if (allTypesZero) {
                await transaction('flights')
                    .where('flights_id', flightId)
                    .update({ available: false });
            }

            // Commit the transaction
            await transaction.commit();
            console.log(currentCounts);
            console.log(currentCounts.business, currentCounts.economy, currentCounts.first);
            return insertedTicket;
        } else {
            throw new Error('No available tickets for the specified flight.');
        }
    } catch (err) {
        // Rollback the transaction if an error occurs
        await transaction.rollback();
        console.error(err);
        throw new Error('Error adding Ticket');
    }
};

const updateTicket = async (ticket_id, ticketData) => {
    try {
        return await db('ticketbooking')
            .where({ ticket_id: ticket_id })
            .update(ticketData)
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error updating Ticket');
    }
};

const markTicketAsDeleted = async (ticket_id) => {
    try {
        return await db('ticketbooking')
            .where({ ticket_id: ticket_id })
            .update({ is_deleted: true });
    } catch (err) {
        console.error(err);
        throw new Error('Error marking Ticket as deleted');
    }
};

// const getDestinationsPaginated = async (page, pageSize) => {
//     try {
//         const offset = (page - 1) * pageSize;
//         return await db('destinations')
//             .orderBy('title', 'asc')
//             .where('is_deleted', false)
//             .limit(pageSize)
//             .offset(offset);
//     } catch (err) {
//         console.error(err);
//         throw new Error('Error fetching paginated accommodations');
//     }
// };



module.exports = {

    getTickets,

    getTicketByID,

    addTicket,

    updateTicket,

    markTicketAsDeleted,

    // getDestinationsPaginated
};
