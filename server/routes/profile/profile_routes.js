const { Router } = require("express");
const profileController = require("../../controllers/profile/profile_controller");
const verifyJWT = require("../../Middleware/VerifyJWT");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = Router();

router.get(
  "/getUserId",
  verifyJWT.authorize([1, 2]),
  profileController.getUserId
);

router.get(
  "/getBookingOfUser",
  verifyJWT.authorize([1, 2]),
  profileController.getBookingOfUser
);

router.get(
  "/getFlightsOfUser",
  verifyJWT.authorize([1, 2]),
  profileController.getFlightsOfUser
);

router.put(
  "/updateUserData",
  upload.single("image"),
  verifyJWT.authorize([1, 2]),
  profileController.updateUserData
);

router.put(
  "/deleteUser",
  verifyJWT.authorize([2]),
  profileController.deleteUser
);

module.exports = router;
