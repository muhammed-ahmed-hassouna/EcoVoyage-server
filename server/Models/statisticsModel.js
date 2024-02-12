const db = require('../Models/config/knexConfig');

const getBookingCount = async () => {
    try {
        return await db('booking').count('* as count');
    } catch (error) {
        console.error('Error fetching booking count:', error);
    }
}
const getCommentCount = async () => {
    try {
        return await db('comments').count('* as count');
    } catch (error) {
        console.error('Error fetching comment count:', error);
    }
}


module.exports = {
    getBookingCount,

    getCommentCount
}