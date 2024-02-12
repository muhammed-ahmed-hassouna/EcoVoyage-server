const destinationsModel = require('../Models/destinationsModel');

const Firebase = require("../Middleware/FirebaseConfig/FireBaseConfig");

const addDestinations = async (req, res) => {
    try {
        const destinationData = req.body;
        const files = req.files;
        if (files && files.length > 0) {
            const fileUrls = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.originalname}`;
                return await Firebase.uploadFileToFirebase(file, fileName);
            }));

            req.body.destinationimage = fileUrls;
        }
        const result = await destinationsModel.addDestinations(destinationData);

        res.json({ message: 'destination has been added!', data: result[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getDestinations = async (req, res) => {
    try {
        const result = await destinationsModel.getDestinations();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const getDestinationsByID = async (req, res) => {
    const destinations_id = req.params.id;
    try {
        const result = await destinationsModel.getDestinationsByID(destinations_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const updateDestinations = async (req, res) => {
    const destinations_id = req.params.id;
    try {
        const destinationData = req.body;
        const files = req.files;
        if (files && files.length > 0) {
            const fileUrls = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.originalname}`;
                return await Firebase.uploadFileToFirebase(file, fileName);
            }));

            req.body.destinationimage = fileUrls;
        }
        const result = await destinationsModel.updateDestinations(destinations_id, destinationData);

        if (!result.length) {
            return res.status(404).json({ error: 'The destinations not found' });
        } else {
            res.status(200).json({
                message: 'The destinations Updated!',
                data: result[0],
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const markDestinationsAsDeleted = async (req, res) => {
    const destinations_id = req.params.id;
    try {
        const result = await destinationsModel.markDestinationsAsDeleted(destinations_id);

        // if (!result) {
        //     return res.status(404).json({ error: "The destination not found" });
        // } else {
            res.status(200).json({
                message: 'The destination Is Marked as Deleted!',
            });
        // }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getDestinationsPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 4;
        const search = req.query.search;

        if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
            throw new Error("Invalid page or limit parameter")
        }
        const result = await destinationsModel.getDestinationsPaginated(page, pageSize, search);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
module.exports = {

    getDestinations,

    addDestinations,

    updateDestinations,

    markDestinationsAsDeleted,

    getDestinationsByID,

    getDestinationsPaginated
}