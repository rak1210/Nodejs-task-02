const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const rooms = [];
const bookings = [];

app.post('/rooms', (req, res) => {
    const { roomName, seats, amenities, pricePerHour } = req.body;
    const newRoom = {
        id: rooms.length + 1,
        roomName,
        seats,
        amenities,
        pricePerHour,
        bookings: []
    };
    rooms.push(newRoom);
    res.status(201).json(newRoom);
});

app.post('/book', (req, res) => {
    const { date, customerName, startTime, endTime, roomId } = req.body;

    // Check if room is already booked at the given date and time
    const room = rooms.find(r => r.id === roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const isBooked = room.bookings.some(booking =>
        booking.date === date && (
            (startTime >= booking.startTime && startTime < booking.endTime) ||
            (endTime > booking.startTime && endTime <= booking.endTime)
        )
    );

    if (isBooked) return res.status(400).json({ message: 'Room is already booked for the given time' });

    const newBooking = {
        id: bookings.length + 1,
        date,
        customerName,
        startTime,
        endTime,
        roomId
    };

    bookings.push(newBooking);
    room.bookings.push(newBooking);

    res.status(201).json(newBooking);
});


app.get('/rooms', (req, res) => {
    res.json(rooms.map(room => ({
        roomName: room.roomName,
        bookedStatus: room.bookings.length > 0,
        bookings: room.bookings.map(b => ({
            customerName: b.customerName,
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime
        }))
    })));
});


app.get('/customers', (req, res) => {
    const customerData = bookings.map(b => ({
        customerName: b.customerName,
        roomName: rooms.find(r => r.id === b.roomId).roomName,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime
    }));
    res.json(customerData);
});


app.get('/customer/:name/bookings', (req, res) => {
    const { name } = req.params;
    const customerBookings = bookings.filter(b => b.customerName === name);
    res.json(customerBookings.map(b => ({
        customerName: b.customerName,
        roomName: rooms.find(r => r.id === b.roomId).roomName,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        bookingId: b.id,
        bookingDate: b.date,
        bookingStatus: 'Confirmed'
    })));
});