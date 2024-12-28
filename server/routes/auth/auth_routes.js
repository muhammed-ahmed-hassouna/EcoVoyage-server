const { Router } = require("express");
const authController = require("../../controllers/auth/auth__controller");
const router = Router();

router.post("/google", authController.googleLogin);

module.exports = router;
