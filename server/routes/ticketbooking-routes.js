const { Router } = require('express');
const TicketController = require('../controllers/ticketbooking-controller');
const router = Router();

const verifyJWT = require('../Middleware/VerifyJWT');


router.get("/getTickets", TicketController.getTickets);

router.get("/getTicketByID/:id", TicketController.getTicketByID);

router.post("/addTicket", verifyJWT.authorize([1, 2]), TicketController.addTicket);

router.put("/updateTicket/:id", verifyJWT.authorize([1, 2]), TicketController.updateTicket);

router.put("/markTicketAsDeleted/:id", verifyJWT.authorize([2]), TicketController.markTicketAsDeleted);

module.exports = router;