const { Router } = require("express");
const userController = require("../../controllers/user/user_controller");
const router = Router();

const verifyJWT = require("../../Middleware/VerifyJWT");

router.post("/Signup", userController.registerUser);

router.post("/Login", userController.loginUser);

router.put(
  "/MakeAdmin/:id",
  verifyJWT.authorize([2]),
  userController.MakeAdmin
);

router.get("/getUsersPaginated", userController.getUsersPaginated);

module.exports = router;
