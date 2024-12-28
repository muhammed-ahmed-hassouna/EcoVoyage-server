const { Router } = require('express');
const statisticsController = require('../../controllers/statistics/statistics_controller');
const router = Router();

router.get('/getBookingCount', statisticsController.getBookingCount);

router.get('/getCommentCount', statisticsController.getCommentCount);

router.get("/getUserData", statisticsController.getUserData);


module.exports = router;