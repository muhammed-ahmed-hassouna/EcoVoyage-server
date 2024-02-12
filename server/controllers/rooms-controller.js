const roomModel = require('../Models/roomsModel');

const Firebase = require("../Middleware/FirebaseConfig/FireBaseConfig");

const addRoom = async (req, res) => {
    try {
        const roomData = req.body;

        const files = req.files;
        if (files && files.length > 0) {
            const fileUrls = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.originalname}`;
                return await Firebase.uploadFileToFirebase(file, fileName);
            }));
            req.body.room_image = fileUrls;
        }
        const result = await roomModel.addRoom(roomData);

        res.json({ message: 'room has been added!', data: result[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const updateRooms = async (req, res) => {
    const room_id = req.params.id;
    try {
        const roomData = req.body;

        const files = req.files;
        if (files && files.length > 0) {
            const fileUrls = await Promise.all(files.map(async (file) => {
                const fileName = `${Date.now()}_${file.originalname}`;
                return await Firebase.uploadFileToFirebase(file, fileName);
            }));
            req.body.room_image = fileUrls;
        }

        const result = await roomModel.updateRoom(room_id, roomData);

        if (!result.length) {
            return res.status(404).json({ error: 'The room not found' });
        } else {
            res.status(200).json({
                message: 'The room Updated!',
                data: result[0],
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

const getRooms = async (req, res) => {
    try {
        const result = await roomModel.getRooms();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


const getFilteredRooms = async (req, res) => {
    const { accommodation_id, date_from, date_to, adults, children } = req.body;

    // console.log("acc: ", accommodation_id + 'from', date_from + 'to', date_to);

    try {
        const result = await roomModel.getFilteredRooms(accommodation_id, date_from, date_to, adults, children);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};



const BookRoom = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { room_id, accommodation_id, date_from, date_to, adults, children } = req.body;

        // Call the BookRoom function to book the room
        const bookingResult = await roomModel.BookRoom(user_id, room_id, accommodation_id, date_from, date_to, adults, children);

        // Send a success response
        res.status(200).json({ message: 'Room booked successfully', bookingResult });
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
};


const markRoomAsDeleted = async (req, res) => {
    const room_id = req.params.id;
    try {
        const result = await roomModel.markRoomAsDeleted(room_id);

        if (!result) {
            return res.status(404).json({ error: "The room not found" });
        } else {
            res.status(200).json({
                message: 'The room Is Marked as Deleted!',
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    addRoom,

    updateRooms,

    BookRoom,

    getRooms,

    getFilteredRooms,

    markRoomAsDeleted
}