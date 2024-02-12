const { Router } = require('express');
const userController = require('../controllers/user_controller');
const router = Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const verifyJWT = require("../Middleware/VerifyJWT");

router.get("/getUserData", userController.getUserData);

router.get("/getBookingOfUser", verifyJWT.authorize([1, 2]), userController.getBookingOfUser);

router.get("/getFlightsOfUser", verifyJWT.authorize([1, 2]), userController.getFlightsOfUser);

router.put("/CancelTicket/:id", userController.CancelTicket);

router.put("/deleteUser", verifyJWT.authorize([2]), userController.deleteUser);

router.post("/Signup", userController.registerUser);

router.post("/Login", userController.loginUser);

router.put("/updatepassword",  userController.updatepassword);

router.post('/sendEmail', userController.sendEmail);

router.post('/verificationCode', userController.verificationCode);

router.get('/getUserId', verifyJWT.authorize([1, 2]), userController.getUserId);

router.put('/updateUserData', upload.single('image'), verifyJWT.authorize([1, 2]), userController.updateUserData);

router.put('/MakeAdmin/:id', verifyJWT.authorize([2]), userController.MakeAdmin);

router.get('/getUsersPaginated', userController.getUsersPaginated); //

router.post("/google", userController.loginUsers);

module.exports = router;