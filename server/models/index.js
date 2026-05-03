const { sequelize } = require('../config/db');
const User = require('./User');
const Property = require('./Property');
const Message = require('./Message');

// User and Property
User.hasMany(Property, { foreignKey: 'ownerId', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Message Associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

Property.hasMany(Message, { foreignKey: 'propertyId', as: 'messages' });
Message.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

// User Favorites (Many-to-Many self-referential or mapping table)
// For simplicity, we can create a UserFavorites table
const UserFavorites = sequelize.define('UserFavorites', {});
User.belongsToMany(Property, { through: UserFavorites, as: 'favoriteProperties' });
Property.belongsToMany(User, { through: UserFavorites, as: 'favoritedBy' });

module.exports = {
    User,
    Property,
    Message,
    UserFavorites
};
