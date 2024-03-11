const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hotel_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;

// Check MongoDB connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define schemas
const roomTypeSchema = new mongoose.Schema({
    name: String,
});
const roomSchema = new mongoose.Schema({
    name: String,
    roomType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoomType',
    },
    price: Number,
});

// Define models
const RoomType = mongoose.model('RoomType', roomTypeSchema);
const Room = mongoose.model('Room', roomSchema);

// API endpoints

// POST endpoint for room type creation
app.post('/api/v1/room-types', async (req, res) => {
    try {
        const roomType = new RoomType(req.body);
        await roomType.save();
        res.status(201).json(roomType);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET endpoint for fetching all room types
app.get('/api/v1/room-types', async (req, res) => {
    try {
        const roomTypes = await RoomType.find();
        res.json(roomTypes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST endpoint for room creation
app.post('/api/v1/rooms', async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET endpoint for fetching rooms with optional filters
app.get('/api/v1/rooms', async (req, res) => {
    try {
        let query = {};
        if (req.query.roomType) {
            query.roomType = req.query.roomType;
        }
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) {
                query.price.$gte = req.query.minPrice;
            }
            if (req.query.maxPrice) {
                query.price.$lte = req.query.maxPrice;
            }
        }
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }
        const rooms = await Room.find(query);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH endpoint for editing a room
app.patch('/api/v1/rooms/:roomId', async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.roomId, req.body, {
            new: true,
        });
        res.json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE endpoint for deleting a room
app.delete('/api/v1/rooms/:roomId', async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.roomId);
        res.sendStatus(204);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET endpoint for fetching a room by id
app.get('/api/v1/rooms/:roomId', async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }
        res.json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
