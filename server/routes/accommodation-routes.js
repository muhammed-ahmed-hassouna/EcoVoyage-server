const { Router } = require('express');
const accommodationController = require('../controllers/accommodation-controller');
const router = Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const verifyJWT = require('../Middleware/VerifyJWT');

router.get('/getAccommodations', accommodationController.getAccommodations);

router.get('/getAccommodationsPaginated', accommodationController.getAccommodationsPaginated); //

router.post('/addAccommodation', upload.array('files[]'), verifyJWT.authorize([2]), accommodationController.addAccommodation);

router.put(`/updateAccommodation/:id`, upload.array('files[]'), verifyJWT.authorize([2]), accommodationController.updateAccommodation);

router.put('/deleteAccommodation/:id', verifyJWT.authorize([2]), accommodationController.markAccommodationAsDeleted);

router.get('/getAccommodationsByID/:id', accommodationController.getAccommodationsByID);

router.post('/addComment/:id', verifyJWT.authorize([1, 2]), accommodationController.addCommentAccomm);

router.get('/getAccommodationsWithComments/:id', accommodationController.getAccommodationsWithComments);

router.post('/BookAccommodation/:id', verifyJWT.authorize([1, 2]), accommodationController.bookAccommodation);

router.put('/CancelBookAccomm/:id', accommodationController.CancelBookAccomm);

router.get('/getBookAccommodations/:id', accommodationController.getBookAccommodations);

// router.get('/getBookById/:id', accommodationController.getBookById);

module.exports = router;
