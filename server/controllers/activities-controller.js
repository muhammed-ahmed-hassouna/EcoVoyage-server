const db = require('../Models/config/knexConfig');

const activityModel = require('../Models/activityModel');

const Firebase = require("../Middleware/FirebaseConfig/FireBaseConfig");

const addActivities = async (req, res) => {
    try {
        // console.log("Request received:", req.body, req.files);
        // console.log("Modified request body:", req.body);

        const activitiesData = req.body;

        const files = req.files;
        if (files && files.length > 0) {
            const fileUrls = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.originalname}`;
                return await Firebase.uploadFileToFirebase(file, fileName);
            }));

            console.log("File URLs:", fileUrls);

            req.body.imageactivity = fileUrls;
        } else {
            console.log("No files in the request.");
        }


        if (!activitiesData || !files) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        console.log("Modified request body:", req.body);

        const result = await activityModel.addActivities(activitiesData);

        // console.log("Result from the database:", result);

        res.json({ message: 'activities have been added!', data: result[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getActivities = async (req, res) => {
    try {
        const result = await activityModel.getActivities();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const getActivitiesByID = async (req, res) => {
    const activities_id = req.params.id;
    try {
        const result = await activityModel.getActivitiesByID(activities_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const updateActivities = async (req, res) => {
    try {
        const activities_id = req.params.id;
        const activitiesData = req.body;

        const files = req.files;
        if (files && files.length > 0) {
            const fileUrls = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.originalname}`;
                return await Firebase.uploadFileToFirebase(file, fileName);
            }));

            req.body.imageactivity = fileUrls;
        }
        

        const result = await activityModel.updateActivities(activities_id, activitiesData);

        if (!result.length) {
            return res.status(404).json({ error: 'The activities not found' });
        } else {
            res.status(200).json({
                message: 'The activities Updated!',
                data: result[0],
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const markActivityAsDeleted = async (req, res) => {
    const activities_id = req.params.id;
    try {
        const result = await activityModel.markActivityAsDeleted(activities_id);

        if (!result) {
            return res.status(404).json({ error: "The activities not found" });
        } else {
            res.status(200).json({
                message: 'The activities Is Marked as Deleted!',
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const addCommentToAc = async (req, res) => {
    const comment_text = req.body.comment_text;
    const activities_id = req.params.id;
    const user_id = req.user.user_id;

    try {
        const commentResult = await activityModel.addCommentToAc(activities_id, user_id, comment_text);
        res.status(200).json({ message: 'Comment added successfully', commentResult });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getActivitiesWithComments = async (req, res) => {
    const activities_id = req.params.id;
    try {
        const result = await activityModel.getActivitiesWithComments(activities_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getActivitiesPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 4;
        const search = req.query.search;

        if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
            throw new Error("Invalid page or limit parameter")
        }
        const result = await activityModel.getActivitiesPaginated(page, pageSize, search);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};



const BookActivity = async (req, res) => {
    const activities_id = req.params.id;
    const { cost, address, phone, adults, children, date_from, date_to } = req.body;
    const user_id = req.user.user_id;

    try {
        const result = await activityModel.BookActivity(activities_id, cost, user_id, address, phone, adults, children, date_from, date_to);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
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
}