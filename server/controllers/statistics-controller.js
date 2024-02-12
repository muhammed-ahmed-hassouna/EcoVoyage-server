const db = require('../Models/config/knexConfig');

const statisticsModel = require('../Models/statisticsModel');
//const getBookingQuery = `SELECT COUNT(*) FROM booking`;

const getBookingCount = async (req, res) => {
    try {
        const result = await statisticsModel.getBookingCount();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

const getCommentCount = async (req, res) => {
    try {
        const result = await statisticsModel.getCommentCount();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {
    getBookingCount,

    getCommentCount
}