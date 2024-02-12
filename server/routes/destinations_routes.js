const { Router } = require('express');
const destinationController = require('../controllers/destinations_controller');
const router = Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const verifyJWT = require('../Middleware/VerifyJWT');


router.get("/getDestinations", destinationController.getDestinations);

router.get("/getDestinationsByID/:id", destinationController.getDestinationsByID);

router.get("/getDestinationsPaginated", destinationController.getDestinationsPaginated);

router.post("/addDestinations",  upload.array('files[]'), verifyJWT.authorize([2]), destinationController.addDestinations);

router.put("/updateDestinations/:id", upload.array('files[]'), verifyJWT.authorize([1, 2]), destinationController.updateDestinations);

router.put("/markDestinationsAsDeleted/:id", verifyJWT.authorize([2]), destinationController.markDestinationsAsDeleted);

module.exports = router;