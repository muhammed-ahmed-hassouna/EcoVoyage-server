const { Router } = require("express");
const contactUsController = require("../controllers/contactUs_controller");
const router = Router();

const verifyJWT = require('../Middleware/VerifyJWT');

router.post("/sendEmailContact", contactUsController.sendEmailContact);

router.get("/getContact", contactUsController.getContact);

router.get("/getAllContact", contactUsController.getAllContact);

router.get("/getContactById/:id", contactUsController.getContactById);

router.put('/updateContactShownStatus/:id', contactUsController.updateContactShownStatus);

module.exports = router;