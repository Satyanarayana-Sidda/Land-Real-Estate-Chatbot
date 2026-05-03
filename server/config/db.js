const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'estategpt',
    process.env.DB_USER || 'admin',
    process.env.DB_PASSWORD || 'EstateGPTSecret123!',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
        logging: false, // Set to true to see SQL queries
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`MySQL Connected: ${sequelize.config.host}`);
        // Synchronize models
        await sequelize.sync({ alter: true });
        console.log('Database synchronized');
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
