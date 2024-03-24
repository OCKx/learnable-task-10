const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { ObjectId } = require('mongodb');

// Define a user schema for validation
const userSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'guest').required()
});

// Middleware for validating user input
function validateUser(req, res, next) {
    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

// Mock user data for demonstration
const users = [
    { _id: ObjectId(), username: 'admin', password: bcrypt.hashSync('adminpassword', 10), role: 'admin' },
    { _id: ObjectId(), username: 'guest', password: bcrypt.hashSync('guestpassword', 10), role: 'guest' }
];

// Function to find a user by username
function findUserByUsername(username) {
    return users.find(user => user.username === username);
}

// Function to verify user credentials
function verifyUser(username, password) {
    const user = findUserByUsername(username);
    if (!user) return false;
    return bcrypt.compareSync(password, user.password);
}

// Middleware for authentication
function authenticate(req, res, next) {
    const { username, password } = req.body;
    if (!verifyUser(username, password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    next();
}

// Middleware for authorization
function authorize(role) {
    return (req, res, next) => {
        const user = findUserByUsername(req.body.username);
        if (!user || user.role !== role) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        next();
    };
}

// Generate JWT token
function generateToken(username, role) {
    return jwt.sign({ username, role }, 'secretkey', { expiresIn: '1h' });
}

module.exports = {
    validateUser,
    authenticate,
    authorize,
    generateToken
};
