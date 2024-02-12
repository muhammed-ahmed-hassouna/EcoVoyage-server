const db = require('../Models/config/knexConfig');

const addRoom = async (roomData) => {
    try {
        return await db('rooms')
            .insert(roomData)
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error adding room');
    }
};

const updateRoom = async (room_id, roomData) => {
    try {
        return await db('rooms')
            .where({ room_id: room_id })
            .update(roomData)
            .returning('*');
    } catch (err) {
        console.error(err);
        throw new Error('Error updating room');
    }
};

const getRooms = async () => {
    try {
        return await db
            .select('*')
            .from('rooms')
            .where({
                is_deleted: false,
            })
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching rooms');
    }
};


const getFilteredRooms = async (accommodation_id, date_from, date_to, adults, children) => {
    const total_guests = adults + children;
    try {
        const result = await db('rooms')
            .select('*')
            .whereNotExists(function () {
                this.select('*')
                    .from('room_booking2')
                    .whereRaw('room_booking2.room_id = rooms.room_id')
                    .andWhere(function () {
                        this.where('room_booking2.date_to', '>=', date_from)
                            .andWhere('room_booking2.date_from', '<=', date_to);
                    });
            })
            .andWhere('rooms.accommodation_id', accommodation_id)
            .andWhere('rooms.capacity', '>=', total_guests)
            .andWhere({
                is_deleted: false,
            });

        return result;
    } catch (err) {
        console.error(err);
        throw new Error('Error filtering rooms: ' + err.message);
    }
};

const BookRoom = async (user_id, room_id, accommodation_id, date_from, date_to, adults, children) => {
    try {
        const isRoomAvailable = await getFilteredRooms(accommodation_id, date_from, date_to, adults, children);

        const selectedRoom = isRoomAvailable.filter((room) => {
            return room.room_id === room_id;
        });

        // console.log('Room:', selectedRoom);
        // console.log('Filtered Rooms:', isRoomAvailable);

        if (selectedRoom.length > 0) {
            const bookingResult = await db('room_booking2').insert({
                room_id: room_id,
                user_id: user_id,
                date_from: date_from,
                date_to: date_to,
                accommodation_id: accommodation_id
            });

            return bookingResult;
        } else {
            throw new Error('Room is not available for the specified dates.');
        }
    } catch (err) {
        console.error(err);
        throw new Error('Error booking room: ' + err.message);
    }
};

const markRoomAsDeleted = async (room_id) => {
    try {
        return await db('rooms')
            .where({ room_id: room_id })
            .update({ is_deleted: true });
    } catch (err) {
        console.error(err);
        throw new Error('Error marking room as deleted');
    }
};

module.exports = {
    addRoom,

    updateRoom,

    BookRoom,

    getFilteredRooms,

    getRooms,

    markRoomAsDeleted
}