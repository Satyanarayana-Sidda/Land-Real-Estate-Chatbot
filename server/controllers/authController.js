const asyncHandler = require('express-async-handler');
const { User, Property, UserFavorites } = require('../models');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
        res.json({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url,
            token: generateToken(user.id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
    const { full_name, email, password, role } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        full_name,
        email,
        password,
        role: role || 'customer',
    });

    if (user) {
        res.status(201).json({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (user) {
        res.json({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (user) {
        user.full_name = req.body.full_name || user.full_name;
        user.avatar_url = req.body.avatar_url || user.avatar_url;
        user.phone = req.body.phone || user.phone;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            id: updatedUser.id,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar_url: updatedUser.avatar_url,
            token: generateToken(updatedUser.id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user favorites
// @route   GET /api/auth/favorites
const getFavorites = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        include: [{ model: Property, as: 'favoriteProperties' }]
    });
    
    if (user) {
        res.json(user.favoriteProperties);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Toggle favorite property
// @route   PUT /api/auth/favorites/:propertyId
const toggleFavorite = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    const propertyId = req.params.propertyId;

    if (user) {
        const hasFavorite = await user.hasFavoriteProperty(propertyId);

        if (hasFavorite) {
            await user.removeFavoriteProperty(propertyId);
        } else {
            await user.addFavoriteProperty(propertyId);
        }

        const updatedFavorites = await user.getFavoriteProperties();
        res.json(updatedFavorites);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { 
    authUser, 
    registerUser, 
    getUserProfile, 
    updateUserProfile,
    getFavorites,
    toggleFavorite
};
