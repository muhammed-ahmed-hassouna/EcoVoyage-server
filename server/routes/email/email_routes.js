const { Router } = require("express");
const emailController = require("../../controllers/email/email_controller");
const router = Router();

router.post("/sendEmail", emailController.sendEmail);

router.post("/verificationCode", emailController.verificationCode);

router.put("/updatePassword", emailController.updatePassword);

module.exports = router;