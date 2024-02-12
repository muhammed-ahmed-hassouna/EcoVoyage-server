const db = require('../Models/config/db');
const knex = require('../Models/config/knexConfig');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Utility function for hashing passwords
const hashPassword = async (password) => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};

// Utility function for generating JWT tokens
const generateToken = (payload) => {
    const secretKey = process.env.SECRET_KEY;
    return jwt.sign(payload, secretKey, { expiresIn: '7d' });
};

const emailExists = async (email) => {
    const result = await knex('users').where('email', email).select('user_id');
    return result.length > 0;
};

// Validation function
const validateUserInput = ({ first_name, last_name, email, password, confirm_password, country }) => {
    const schema = Joi.object({
        first_name: Joi.string().min(3).max(25).required(),
        last_name: Joi.string().min(3).max(25).required(),
        email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&!])[A-Za-z\\d@#$%^&!]{8,30}$')).required(),
        confirm_password: Joi.any().equal(Joi.ref('password')).required(),
        country: Joi.string().min(3).max(25).required()
    });

    const { error } = schema.validate({ first_name, last_name, email, password, confirm_password, country });
    return error ? { error: error.details } : {};
};

// Model function
const registerUser = async ({ first_name, last_name, email, password, confirm_password, country }) => {
    try {
        const validationError = validateUserInput({ first_name, last_name, email, password, confirm_password, country });

        if (validationError.error) {
            return { error: validationError.error };
        }

        const emailAlreadyExists = await emailExists(email);

        if (emailAlreadyExists) {
            return { emailExists: true };
        }

        const hashedPassword = await hashPassword(password);

        const [user] = await knex('users')
            .insert({
                first_name,
                last_name,
                email,
                password: hashedPassword,
                role_id: 1, // Assuming role_id is hardcoded for new registrations
                country
            })
            .returning('user_id');

        const payload = {
            first_name,
            last_name,
            email,
            user_id: user.user_id,
            role_id: 1 // Assuming role_id is hardcoded for new registrations
        };

        const token = generateToken(payload);

        return {
            token,
            role_id: 1 // Assuming role_id is hardcoded for new registrations
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};


const loginUser = async ({ email, password }) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
        });

        const validate = schema.validate({ email });

        if (validate.error) {
            return { error: validate.error.details };
        } else {
            const userData = await knex('users').where('email', email).select('*').first();

            if (!userData) {
                return { message: "Email is invalid" };
            }

            const storedHashedPassword = userData.password;

            const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

            if (!passwordMatch) {
                return { message: "Password is invalid" };
            }

            const payload = {
                first_name: userData.first_name,
                last_name: userData.last_name,
                user_id: userData.user_id,
                email: userData.email,
                role_id: userData.role_id
            };

            const token = generateToken(payload);

            return {
                validate,
                token,
                role_id: userData.role_id,
                user_id: userData.user_id
            };
        }
    } catch (err) {
        console.error(err);
        throw err; // Propagate the error to be handled in the controller
    }
};

const getUserByIdQuery = `
    SELECT * FROM users 
    WHERE 
        is_deleted = false
        AND user_id = $1`;

const deleteUserQuery = `
    UPDATE users 
    SET 
        is_deleted = true 
    WHERE 
        user_id = $1`;


const updateUser = async (user_id, userData) => {
    try {
        const result = await knex('users')
            .where('user_id', user_id)
            .update(userData)
            .returning('*');

        return result[0];
    } catch (error) {
        throw error;
    }
};

const getBookingOfUser = async (user_id) => {
    try {
        const result = await knex('booking')
            .where('user_id', user_id)
            .where('is_shown', true)
            .select(
                'book_id',
                'phone',
                'cost',
                'adults',
                'children',
                'user_id',
                'activities_id',
                'packages_id'
            );
        return result;
    } catch (error) {
        throw error;
    }
};

const getFlightsOfUser = async (user_id) => {
    try {
        const result = await knex('ticketbooking')
            .where('ticketbooking.user_id', user_id)
            .where('ticketbooking.is_shown', true)
            .select(
                'ticketbooking.ticket_id',
                'ticketbooking.ticket_type',
                'ticketbooking.cost',
                'ticketbooking.user_id',
                'ticketbooking.flights_id',
                'flights.depart_date',
                'flights.return_date'
            )
            .join('flights', 'ticketbooking.flights_id', 'flights.flights_id');

        return result;
    } catch (error) {
        throw error;
    }
};
const CancelTicket = async (ticket_id) => {
    try {
        return await knex('ticketbooking')
            .where({ ticket_id: ticket_id })
            .update({ is_shown: false })
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error Cancel Ticket');
    }
};

const getUserPaginated = async (page, pageSize, search) => {
    try {
        if (page <= 0 || pageSize <= 0) {
            throw new Error("Invalid page or pageSize");
        }

        const offset = (page - 1) * pageSize;

        let query = knex('users')
            .orderBy('first_name', 'asc')
            .where('is_deleted', false)
            .limit(pageSize)
            .offset(offset);

        if (search) {
            query = query.whereRaw('LOWER(first_name) LIKE ?', `%${search.toLowerCase()}%`);
        }

        // Subquery to get total count
        const totalCountQuery = knex('users')
            .count('* as count')
            .where('is_deleted', false);

        if (search) {
            totalCountQuery.whereRaw('LOWER(first_name) LIKE ?', `%${search.toLowerCase()}%`);
        }

        const totalCountResult = await totalCountQuery.first();

        return { data: await query, totalCount: totalCountResult.count };
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching paginated Users');
    }
};


const getUserByEmails = async (email) => {
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const user = await db.query(userQuery, [email]);
    return user.rows[0];
}

const createUsers = async ({ first_name, last_name, email, picture }) => {
    const role_id = 1;
    // const created_at = new Date();
    const password = "No Access";
    // const phone = "00000000";
    const country = "No Access";
    const query = `
    INSERT INTO users (first_name,last_name, email, password, country, role_id, profileimage) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`;

    const values = [
        first_name,

        last_name,

        email,

        password,
        
        country,
        // phone,
        role_id,
        // created_at,
        picture,
    ];
    const user = await db.query(query, values);
    return user.rows[0];
}

module.exports = {
    registerUser,

    loginUser,

    getUserByIdQuery,

    updateUser,

    deleteUserQuery,

    getBookingOfUser,

    getFlightsOfUser,

    CancelTicket,

    getUserPaginated,

    getUserByEmails,

    createUsers
};