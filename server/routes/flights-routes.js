const { Router } = require('express');
const flightController = require('../controllers/flights-controller');
const router = Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const verifyJWT = require('../Middleware/VerifyJWT');

router.post("/addFlight", upload.single('image'), verifyJWT.authorize([2]), flightController.addFlight);

router.get("/getFlights", flightController.getFlights);

router.put("/softDeleteFlight/:id", verifyJWT.authorize([2]), flightController.softDeleteFlight);

router.put("/updateFlight/:id", upload.single('image'), verifyJWT.authorize([2]), flightController.updateFlight);

router.get('/getFlightsPaginated', flightController.getFlightsPaginated);

router.get('/getFlightsByID/:id', flightController.getFlightsByID);

module.exports = router;