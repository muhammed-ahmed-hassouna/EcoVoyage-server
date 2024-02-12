const ticketBookingModel = require('../Models/ticketbookingModel');

const addTicket = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const ticketData = req.body;

        const result = await ticketBookingModel.addTicket(ticketData, user_id);

        if (result) {
            res.json(result);
        } else {
            res.status(400).json({ error: 'Failed to add ticket' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getTickets = async (req, res) => {
    try {
        const result = await ticketBookingModel.getTickets();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const getTicketByID = async (req, res) => {
    const ticket_id = req.params.id;
    try {
        const result = await ticketBookingModel.getTicketByID(ticket_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const updateTicket = async (req, res) => {
    const ticket_id = req.params.id;
    const ticketData = req.body;
    try {
        const result = await ticketBookingModel.updateTicket(ticket_id, ticketData);

        if (!result.length) {
            return res.status(404).json({ error: 'The Ticket not found' });
        } else {
            res.status(200).json({
                message: 'The Ticket Updated!',
                data: result[0],
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const markTicketAsDeleted = async (req, res) => {
    const ticket_id = req.params.id;
    try {
        const result = await ticketBookingModel.markTicketAsDeleted(ticket_id);

        if (!result) {
            return res.status(404).json({ error: "The destination not found" });
        } else {
            res.status(200).json({
                message: 'The destination Is Marked as Deleted!',
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

// const getDestinationsPaginated = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const pageSize = parseInt(req.query.pageSize) || 4;

//         const result = await destinationsModel.getDestinationsPaginated(page, pageSize);

//         if (!result) {
//             return res.status(404).json({ error: "No Data !" });
//         } else {
//             res.json({
//                 data: result,
//                 currentPage: page,
//                 pageSize: pageSize,
//             });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error');
//     }
// };

module.exports = {

    getTickets,

    addTicket,

    updateTicket,

    markTicketAsDeleted,

    getTicketByID,

}