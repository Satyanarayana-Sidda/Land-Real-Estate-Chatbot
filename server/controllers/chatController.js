const asyncHandler = require('express-async-handler');
const { Message, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, content, propertyId } = req.body;

    if (!receiverId || !content) {
        res.status(400);
        throw new Error('Receiver ID and Content are required');
    }

    const message = await Message.create({
        senderId: req.user.id,
        receiverId: receiverId,
        propertyId: propertyId || null,
        content: content,
        is_read: false
    });

    res.status(201).json(message);
});

// @desc    Get messages between current user and another user
// @route   GET /api/chat/:contactId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const contactId = req.params.contactId;

    const messages = await Message.findAll({
        where: {
            [Op.or]: [
                { senderId: req.user.id, receiverId: contactId },
                { senderId: contactId, receiverId: req.user.id }
            ]
        },
        order: [['createdAt', 'ASC']]
    });

    // Mark as read if receiver is current user
    await Message.update(
        { is_read: true },
        {
            where: {
                senderId: contactId,
                receiverId: req.user.id,
                is_read: false
            }
        }
    );

    res.json(messages);
});

// @desc    Get list of conversations (users chatted with)
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find all messages involving user
    const messages = await Message.findAll({
        where: {
            [Op.or]: [{ senderId: userId }, { receiverId: userId }]
        },
        order: [['createdAt', 'DESC']]
    });

    const conversations = [];
    const seenPartners = new Set();

    for (const msg of messages) {
        const partnerId = msg.senderId.toString() === userId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString();

        if (!seenPartners.has(partnerId)) {
            seenPartners.add(partnerId);

            // Get partner details
            const partner = await User.findByPk(partnerId, {
                attributes: ['id', 'full_name', 'avatar_url']
            });

            if (partner) {
                conversations.push({
                    id: partner.id,
                    name: partner.full_name,
                    avatar: partner.avatar_url,
                    lastMessage: msg.content,
                    time: msg.createdAt, 
                    unread: msg.receiverId.toString() === userId.toString() && !msg.is_read ? 1 : 0
                });
            }
        }
    }

    res.json(conversations);
});

// @desc    Clear chat history with a user
// @route   DELETE /api/chat/:contactId
// @access  Private
const clearChat = asyncHandler(async (req, res) => {
    const contactId = req.params.contactId;

    await Message.destroy({
        where: {
            [Op.or]: [
                { senderId: req.user.id, receiverId: contactId },
                { senderId: contactId, receiverId: req.user.id }
            ]
        }
    });

    res.json({ message: 'Chat cleared successfully' });
});

module.exports = {
    sendMessage,
    getMessages,
    getConversations,
    clearChat
};
