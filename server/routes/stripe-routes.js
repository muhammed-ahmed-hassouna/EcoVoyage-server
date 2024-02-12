const { Router } = require('express');
const stripeController = require('../controllers/stripe-controller');
const router = Router();

const verifyJWT = require('../Middleware/VerifyJWT');

router.post('/payment', verifyJWT.authorize([ 1, 2 ]), stripeController.payment);

module.exports = router;