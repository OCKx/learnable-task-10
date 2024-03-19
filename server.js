const express = require('express');
const bodyParser = require('body-parser');
const dbConnector = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect to the database
dbConnector.connectToDb((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    } else {
        console.log('Connected to database successfully');
    }
});

// Define routes
// Your route handlers will go here

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Create a POST endpoint for storage of room types
app.post('/api/v1/rooms_types', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    const roomType = {
        name: name
    };
    dbConnector.getDb().collection('rooms_types').insertOne(roomType, (err, result) => {
        if (err) {
            console.error('Error storing room type:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json(result.ops[0]);
    });
});

// Create a GET endpoint for fetching all room types
app.get('/api/v1/rooms_types', (req, res) => {
    dbConnector.getDb().collection('rooms_types').find({}).toArray((err, roomTypes) => {
        if (err) {
            console.error('Error fetching room types:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(roomTypes);
    });
});

// Create a POST endpoint for storage of rooms
app.post('/api/v1/rooms', (req, res) => {
    const { name, roomType, price } = req.body;
    if (!name || !roomType || !price) {
        return res.status(400).json({ error: 'Name, roomType, and price are required' });
    }
    const room = {
        name: name,
        roomType: roomType,
        price: price
    };
    dbConnector.getDb().collection('rooms').insertOne(room, (err, result) => {
        if (err) {
            console.error('Error storing room:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json(result.ops[0]);
    });
});

// Create a GET endpoint for fetching all rooms with optional filters
app.get('/api/v1/rooms', (req, res) => {
    const { search, roomType, minPrice, maxPrice } = req.query;
    const query = {};
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }
    if (roomType) {
        query.roomType = roomType;
    }
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) {
            query.price.$gte = parseInt(minPrice);
        }
        if (maxPrice) {
            query.price.$lte = parseInt(maxPrice);
        }
    }
    dbConnector.getDb().collection('rooms').find(query).toArray((err, rooms) => {
        if (err) {
            console.error('Error fetching rooms:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rooms);
    });
});

// Create a PATCH endpoint for editing a room using its id
app.patch('/api/v1/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const { name, roomType, price } = req.body;
    if (!name && !roomType && !price) {
        return res.status(400).json({ error: 'At least one field to update is required' });
    }
    const updateFields = {};
    if (name) {
        updateFields.name = name;
    }
    if (roomType) {
        updateFields.roomType = roomType;
    }
    if (price) {
        updateFields.price = price;
    }
    dbConnector.getDb().collection('rooms').updateOne({ _id: roomId }, { $set: updateFields }, (err, result) => {
        if (err) {
            console.error('Error updating room:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Room updated successfully' });
    });
});

// Create a DELETE endpoint for deleting a room using its id
app.delete('/api/v1/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    dbConnector.getDb().collection('rooms').deleteOne({ _id: roomId }, (err, result) => {
        if (err) {
            console.error('Error deleting room:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Room deleted successfully' });
    });
});

// Create a GET endpoint for fetching a room using its id
app.get('/api/v1/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    dbConnector.getDb().collection('rooms').findOne({ _id: roomId }, (err, room) => {
        if (err) {
            console.error('Error fetching room:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json(room);
    });
});
