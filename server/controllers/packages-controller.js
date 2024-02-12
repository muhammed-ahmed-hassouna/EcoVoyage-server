const packagesModel = require('../Models/packageModel');

const Firebase = require("../Middleware/FirebaseConfig/FireBaseConfig");

const addPackages = async (req, res) => {
    try {
        const packagesData = req.body;

        const files = req.files;
        if (files && files.length > 0) {
            const fileUrls = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.originalname}`;
                return await Firebase.uploadFileToFirebase(file, fileName);
            }));
            req.body.imagePAC = fileUrls;
        }
        const result = await packagesModel.addPackages(packagesData);

        res.json({ message: 'packages has been added!', data: result[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getPackages = async (req, res) => {
    try {
        const result = await packagesModel.getPackages();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getPackagesById = async (req, res) => {
    const packages_id = req.params.id;
    try {
        const result = await packagesModel.getPackagesById(packages_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const updatePackages = async (req, res) => {
    const packages_id = req.params.id;
    try {
        const packagesData = req.body;

        const files = req.files;
        if (files && files.length > 0) {
            const fileUrls = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.originalname}`;
                return await Firebase.uploadFileToFirebase(file, fileName);
            }));
            req.body.imagePAC = fileUrls;
        }

        const result = await packagesModel.updatePackages(packages_id, packagesData);

        if (!result.length) {
            return res.status(404).json({ error: 'The packages not found' });
        } else {
            res.status(200).json({
                message: 'The packages Updated!',
                data: result[0],
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const markPackagesAsDeleted = async (req, res) => {
    const packages_id = req.params.id;
    try {
        const result = await packagesModel.markPackagesAsDeleted(packages_id);

        if (!result) {
            return res.status(404).json({ error: "The packages not found" });
        } else {
            res.status(200).json({
                message: 'The packages Is Marked as Deleted!',
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const addCommentPac = async (req, res) => {
    const comment_text = req.body.comment_text;
    const packages_id = req.params.id;
    const user_id = req.user.user_id;

    try {
        const commentResult = await packagesModel.addCommentPac(packages_id, user_id, comment_text);
        res.json({ message: 'Comment added successfully', comment: commentResult[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getPackagesWithComments = async (req, res) => {
    const packages_id = req.params.id;
    try {
        const result = await packagesModel.getPackagesWithComments(packages_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const BookPackage = async (req, res) => {
    const packages_id = req.params.id;
    const { cost, address, phone, adults, children, date_from, date_to } = req.body;
    const user_id = req.user.user_id;

    try {
        const result = await packagesModel.BookPackage(packages_id, cost, user_id, address, phone, adults, children, date_from, date_to);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getBookPackages = async (req, res) => {
    const packages_id = req.params.id;
    try {
        const result = await packagesModel.getBookPackages(packages_id);

        if (!result.length) {
            return res.status(404).json({ error: "No Books In this packages !" });
        } else {
            res.json(result);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getPackagesPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 4;
        const search = req.query.search;

        if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
            throw new Error("Invalid page or limit parameter")
        }
        const result = await packagesModel.getPackagesPaginated(page, pageSize, search);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }

};

module.exports = {

    getPackages,

    addPackages,

    updatePackages,

    markPackagesAsDeleted,

    getPackagesById,

    addCommentPac,

    getPackagesWithComments,

    BookPackage,

    getBookPackages,

    getPackagesPaginated

}