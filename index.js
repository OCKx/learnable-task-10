const express = require('express');
const { connectToDb, getDb } = require('./db');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const { validateUser, authenticate, authorize, generateToken } = require('./user');
require("dotenv").config()

const app = express();
app.use(bodyParser.json());

// Connect to the database
const PORT = process.env.PORT || 3000;
let db;

connectToDb((err) => {
    if (!err) {
        app.listen(PORT, () => {
            console.log(`listening to port ${PORT}`);
        })
        db = getDb()
    }
});

// Define routes
app.get('/', (req, res) => {
    res.send('Welcome to the hotel management API');
});


// Create a POST endpoint for storage of room types
app.post('/api/v1/rooms-types', validateUser, authenticate, authorize('admin'), (req, res) => {
    const { name } = req.body;
    const roomType = {
        name: name
    };

    db.collection('rooms_types').insertOne(roomType)
        .then((doc) => {
            res.status(201).json(doc);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Internal server error' });
        });
});

// Create a GET endpoint for fetching all room types
app.get('/api/v1/rooms-types', (req, res) => {
    let roomstypes = [];
    db.collection('rooms_types').find().forEach(roomtype => {
        roomstypes.push(roomtype)
    }).then(() => {
        res.status(200).json(roomstypes)
    }).catch(() => {
        res.status(500).json({error: 'cannot fetch rooms_types'})
    })
});

// Create a POST endpoint for storage of rooms
app.post('/api/v1/rooms', (req, res) => {
    const { name, roomType, price } = req.body;
    const room = {
        name: name,
        roomType: new ObjectId(roomType),
        price: price
    };

    db.collection('rooms').insertOne(room)
        .then((doc) => {
            res.status(201).json(doc)
        })
        .catch((err) => {
            res.status(500).json({error: 'bad request'})
        })
})

// Create a GET endpoint for fetching all rooms with optional filters
app.get('/api/v1/rooms', (req, res) => {
    const { search, roomType, minPrice, maxPrice } = req.query;
    console.log('Request Query:', req.query); 

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
    console.log('Query Object:', query);

    db.collection('rooms').find(query).toArray((err, rooms) => {
        if (err) {
            console.error('Error fetching rooms:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rooms);
    });
});

// Create a PATCH endpoint for editing a room using its id
app.patch('/api/v1/rooms/:Id', (req, res) => {
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

    db.collection('rooms').updateOne(
        { _id: new ObjectId(req.params.Id) },
        { $set: updateFields },
    )
    .then((result) => {
        res.status(200).json(result);
    })
    .catch((err) => {
        console.error('Error updating room:', err);
        res.status(500).json({ error: 'Internal server error' });
    });
});


// Create a DELETE endpoint for deleting a room using its id
app.delete('/api/v1/rooms/:id', (req, res) => {
    db.collection('rooms').deleteOne({ _id: new ObjectId(req.params.id)}).then((doc) => {
        res.status(200).json(doc)
    }).catch((err) => {
        res.status(500).json({error: 'cannot complete request'})
    });
});

// Create a GET endpoint for fetching a room using its id
app.get('/api/v1/rooms/:roomid', (req, res) => {
    db.collection('rooms').findOne({_id: new ObjectId(req.params.roomid)}).then((doc) => {
        res.status(200).json(doc)
    }).catch((err) => {
        res.status(500).json({error: 'cannot complete request'})
    })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});