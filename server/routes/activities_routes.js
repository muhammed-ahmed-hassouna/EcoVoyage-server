const { Router } = require('express');
const activitiesController = require('../controllers/activities-controller');
const router = Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const verifyJWT = require('../Middleware/VerifyJWT');

router.get('/getActivities', activitiesController.getActivities);

router.get('/getActivitiesPaginated', activitiesController.getActivitiesPaginated); //

router.post('/addActivities', upload.array('files[]'), activitiesController.addActivities);

router.put(`/updateActivities/:id`, upload.array('files[]'), verifyJWT.authorize([2]), activitiesController.updateActivities);

router.put('/markActivityAsDeleted/:id', verifyJWT.authorize([2]), activitiesController.markActivityAsDeleted);

router.get('/getActivitiesByID/:id', activitiesController.getActivitiesByID);

router.post('/addCommentToAc/:id', verifyJWT.authorize([1, 2]), activitiesController.addCommentToAc);

router.get('/getActivitiesWithComments/:id', activitiesController.getActivitiesWithComments);

router.post('/BookActivity/:id', verifyJWT.authorize([1, 2]), activitiesController.BookActivity);

module.exports = router;
