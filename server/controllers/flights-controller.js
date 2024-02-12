const db = require('../Models/config/db');

const Firebase = require('../Middleware/FirebaseConfig/FireBaseConfig');
const flightsModel = require('../Models/flightsModel');

const addFlight = async (req, res) => {
    try {
        const flightsData = req.body;
        const file = req.file;

        if (file) {
            const fileName = `${Date.now()}_${file.originalname}`;
            const fileUrl = await Firebase.uploadFileToFirebase(file, fileName);

            req.body.imagecomp = fileUrl;
        }

        const result = await flightsModel.addFlight(flightsData);

        res.json({ message: 'Flight has been added!', data: result[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getFlights = async (req, res) => {
    try {
        const result = await flightsModel.getFlights();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

const getFlightsByID = async (req, res) => {
    const flights_id = req.params.id;
    try {
        const result = await flightsModel.getFlightsByID(flights_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const softDeleteFlight = async (req, res) => {
    const flights_id = req.params.id;
    try {
        const result = await flightsModel.softDeleteFlights(flights_id);

        if (!result) {
            return res.status(404).json({ error: "The flight not found" });
        } else {
            res.status(200).json({
                message: 'The flight Is Marked as Deleted!',
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}


const updateFlight = async (req, res) => {
    const flights_id = req.params.id;
    const flightsData = req.body;
    try {
        const file = req.file;

        if (file) {
            const fileName = `${Date.now()}_${file.originalname}`;
            const fileUrl = await Firebase.uploadFileToFirebase(file, fileName);

            req.body.imagecomp = fileUrl;
        }

        const result = await flightsModel.updateFlight(flights_id, flightsData);

        if (!result.length) {
            return res.status(404).json({ error: 'The Flight not found' });
        } else {
            res.status(200).json({
                message: 'The Flight Updated!',
                data: result[0],
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getFlightsPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 4;
        const search = req.query.search;

        if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
            throw new Error("Invalid page or limit parameter")
        }
        const result = await flightsModel.getFlightsPaginated(page, pageSize, search);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    addFlight,

    getFlights,

    softDeleteFlight,

    updateFlight,

    getFlightsPaginated,

    getFlightsByID
};