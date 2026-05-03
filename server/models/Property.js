const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Property = sequelize.define('Property', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
    },
    state: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    size: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    size_unit: {
        type: DataTypes.STRING,
        defaultValue: 'acres',
    },
    description: {
        type: DataTypes.TEXT,
    },
    images: {
        type: DataTypes.JSON, // Stores array of strings
        defaultValue: [],
    },
    status: {
        type: DataTypes.ENUM('available', 'pending', 'sold'),
        defaultValue: 'available',
    },
    views_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    land_type: {
        type: DataTypes.STRING,
    },
    facing_direction: {
        type: DataTypes.STRING,
    },
    road_width_feet: {
        type: DataTypes.FLOAT,
    },
    is_clear_title: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    water_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    electricity_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
});

module.exports = Property;
