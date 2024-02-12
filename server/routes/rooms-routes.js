const { Router } = require('express');

const router = Router();

const roomsController = require('../controllers/rooms-controller');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const verifyJWT = require('../Middleware/VerifyJWT');

router.post('/addRoom', upload.array('image', 4), verifyJWT.authorize([2]), roomsController.addRoom);

router.put(`/updateRoom/:id`, upload.array('image', 6), verifyJWT.authorize([2]), roomsController.updateRooms);

router.post('/getFilteredRooms', roomsController.getFilteredRooms);

router.get('/getRooms', roomsController.getRooms);

router.post('/BookRoom', verifyJWT.authorize([1, 2]), roomsController.BookRoom);

router.put('/markRoomAsDeleted/:id', verifyJWT.authorize([2]), roomsController.markRoomAsDeleted);

module.exports = router;