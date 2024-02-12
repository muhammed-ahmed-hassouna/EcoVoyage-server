const db = require('../Models/config/knexConfig');
const AccommodationModel = require('../Models/AccommodationModel');

const Firebase = require("../Middleware/FirebaseConfig/FireBaseConfig")
const addAccommodation = async (req, res) => {
    try {
        const accommodationData = req.body;

        // Assuming amenities is a comma-separated string
        if (accommodationData.amenities) {
            accommodationData.amenities = accommodationData.amenities.split(',');
        }
        
        const files = req.files;
        if (files && files.length > 0) {
            const fileUrls = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.originalname}`;
                return await Firebase.uploadFileToFirebase(file, fileName);
            }));

            req.body.imageurl = fileUrls;
        }

        const result = await AccommodationModel.addAccommodation(accommodationData);

        res.json({ message: 'Accommodation has been added!', data: result[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAccommodations = async (req, res) => {
    try {
        const result = await AccommodationModel.getAccommodations();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getAccommodationsByID = async (req, res) => {
    const accommodation_id = req.params.id;
    try {
        const result = await AccommodationModel.getAccommodationsByID(accommodation_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const updateAccommodation = async (req, res) => {
    const accommodation_id = req.params.id;
    try {
        const accommodationData = req.body;

        if (accommodationData.amenities) {
            accommodationData.amenities = accommodationData.amenities.split(',');
        }

        const files = req.files;
        if (files && files.length > 0) {
            const fileUrls = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.originalname}`;
                return await Firebase.uploadFileToFirebase(file, fileName);
            }));

            req.body.imageurl = fileUrls;
        }

        const result = await AccommodationModel.updateAccommodation(accommodation_id, accommodationData);

        if (!result.length) {
            return res.status(404).json({ error: 'The Accommodation not found' });
        } else {
            res.status(200).json({
                message: 'The Accommodation Updated!',
                data: result[0],
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const markAccommodationAsDeleted = async (req, res) => {
    const accommodation_id = req.params.id;
    try {
        const result = await AccommodationModel.markAccommodationAsDeleted(accommodation_id);

        if (!result) {
            return res.status(404).json({ error: "The Accommodation not found" });
        } else {
            res.status(200).json({
                message: 'The Accommodation Is Marked as Deleted!',
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const addCommentAccomm = async (req, res) => {
    const comment_text = req.body.comment_text;
    const accommodation_id = req.params.id;
    const user_id = req.user.user_id;

    try {
        const commentResult = await AccommodationModel.addComment(accommodation_id, user_id, comment_text);
        res.json({ message: 'Comment added successfully', comment: commentResult[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getAccommodationsWithComments = async (req, res) => {
    const accommodation_id = req.params.id;
    try {
        const result = await AccommodationModel.getAccommodationsWithComments(accommodation_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const bookAccommodation = async (req, res) => {
    const accommodation_id = req.params.id;
    const { cost, address, phone, adults, children, date_from, date_to } = req.body;
    const user_id = req.user.user_id;

    try {
        const result = await AccommodationModel.bookAccommodation(cost, accommodation_id, user_id, address, phone, adults, children, date_from, date_to);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
const CancelBookAccomm = async (req, res) => {
    const book_id = req.params.id;
    try {
        const result = await AccommodationModel.CancelBookAccomm(book_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getBookAccommodations = async (req, res) => {
    const accommodation_id = req.params.id;
    try {
        const result = await AccommodationModel.getBookAccommodations(accommodation_id);

        if (!result.length) {
            return res.status(404).json({ error: "No Books In this Accommodation !" });
        } else {
            res.json(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getAccommodationsPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 4;
        const search = req.query.search;


        if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
            throw new Error("Invalid page or limit parameter")
        }
        const result = await AccommodationModel.getAccommodationsPaginated(page, pageSize, search);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {

    getAccommodations,

    addAccommodation,

    updateAccommodation,

    markAccommodationAsDeleted,

    getAccommodationsByID,

    addCommentAccomm,

    getAccommodationsWithComments,

    bookAccommodation,

    getBookAccommodations,

    getAccommodationsPaginated,

    CancelBookAccomm

}