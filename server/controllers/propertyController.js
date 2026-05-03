const asyncHandler = require('express-async-handler');
const { Property, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Fetch all properties (with filtering)
// @route   GET /api/properties
const getProperties = asyncHandler(async (req, res) => {
    const keyword = req.query.keyword ? req.query.keyword : '';
    
    const whereClause = {
        status: 'available'
    };

    if (keyword) {
        whereClause[Op.or] = [
            { title: { [Op.like]: `%${keyword}%` } },
            { location: { [Op.like]: `%${keyword}%` } }
        ];
    }

    const properties = await Property.findAll({ 
        where: whereClause,
        order: [['createdAt', 'DESC']]
    });
    
    res.json(properties);
});

// @desc    Fetch single property
// @route   GET /api/properties/:id
const getPropertyById = asyncHandler(async (req, res) => {
    const property = await Property.findByPk(req.params.id, {
        include: [{ model: User, as: 'owner', attributes: ['id', 'full_name', 'email', 'phone'] }]
    });

    if (property) {
        // Increment views
        property.views_count += 1;
        await property.save();
        res.json(property);
    } else {
        res.status(404);
        throw new Error('Property not found');
    }
});

// @desc    Create a property
// @route   POST /api/properties
// @access  Private/Admin
const createProperty = asyncHandler(async (req, res) => {
    const {
        title, location, city, state, price, size, size_unit,
        description, images, land_type, facing_direction,
        road_width_feet, is_clear_title, water_available, electricity_available
    } = req.body;

    const property = await Property.create({
        ownerId: req.user.id,
        title,
        location,
        city,
        state,
        price,
        size,
        size_unit,
        description,
        images: images || [],
        status: 'available',
        land_type,
        facing_direction,
        road_width_feet,
        is_clear_title,
        water_available,
        electricity_available
    });

    res.status(201).json(property);
});

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private/Admin
const updateProperty = asyncHandler(async (req, res) => {
    const property = await Property.findByPk(req.params.id);

    if (property) {
        if (property.ownerId !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized to update this property');
        }

        property.title = req.body.title || property.title;
        property.location = req.body.location || property.location;
        property.city = req.body.city || property.city;
        property.state = req.body.state || property.state;
        property.price = req.body.price || property.price;
        property.size = req.body.size || property.size;
        property.size_unit = req.body.size_unit || property.size_unit;
        property.description = req.body.description || property.description;
        property.images = req.body.images || property.images;
        property.status = req.body.status || property.status;
        property.land_type = req.body.land_type || property.land_type;
        property.facing_direction = req.body.facing_direction || property.facing_direction;
        property.road_width_feet = req.body.road_width_feet || property.road_width_feet;

        if (req.body.is_clear_title !== undefined) property.is_clear_title = req.body.is_clear_title;
        if (req.body.water_available !== undefined) property.water_available = req.body.water_available;
        if (req.body.electricity_available !== undefined) property.electricity_available = req.body.electricity_available;

        const updatedProperty = await property.save();
        res.json(updatedProperty);
    } else {
        res.status(404);
        throw new Error('Property not found');
    }
});

// @desc    Get user's properties
// @route   GET /api/properties/myproperties
// @access  Private/Admin
const getMyProperties = asyncHandler(async (req, res) => {
    const properties = await Property.findAll({ 
        where: { ownerId: req.user.id },
        order: [['createdAt', 'DESC']]
    });
    res.json(properties);
});

module.exports = {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    getMyProperties
};
