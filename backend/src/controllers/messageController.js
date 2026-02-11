const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { createMessageSchema } = require('../utils/validators');

// Send a message
const sendMessage = async (req, res, next) => {
    try {
        const data = createMessageSchema.parse(req.body);

        const receiver = await prisma.user.findUnique({
            where: { id: data.receiverId },
        });

        if (!receiver) {
            throw ApiError.notFound('Receiver not found');
        }

        const message = await prisma.message.create({
            data: {
                content: data.content,
                senderId: req.user.id,
                receiverId: data.receiverId,
                clubId: data.clubId || null,
            },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, avatar: true },
                },
            },
        });

        // Notify the receiver
        await prisma.notification.create({
            data: {
                title: 'New Message',
                message: `${req.user.firstName} ${req.user.lastName} sent you a message`,
                type: 'system',
                userId: data.receiverId,
                link: `/messages`,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Message sent',
            data: message,
        });
    } catch (error) {
        next(error);
    }
};

// Get conversations (list of users you've messaged with)
const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get distinct users from messages
        const sentMessages = await prisma.message.findMany({
            where: { senderId: userId },
            select: { receiverId: true },
            distinct: ['receiverId'],
        });

        const receivedMessages = await prisma.message.findMany({
            where: { receiverId: userId },
            select: { senderId: true },
            distinct: ['senderId'],
        });

        const userIds = [
            ...new Set([
                ...sentMessages.map((m) => m.receiverId),
                ...receivedMessages.map((m) => m.senderId),
            ]),
        ];

        const conversations = await Promise.all(
            userIds.map(async (otherId) => {
                const user = await prisma.user.findUnique({
                    where: { id: otherId },
                    select: { id: true, firstName: true, lastName: true, avatar: true },
                });

                const lastMessage = await prisma.message.findFirst({
                    where: {
                        OR: [
                            { senderId: userId, receiverId: otherId },
                            { senderId: otherId, receiverId: userId },
                        ],
                    },
                    orderBy: { createdAt: 'desc' },
                });

                const unreadCount = await prisma.message.count({
                    where: {
                        senderId: otherId,
                        receiverId: userId,
                        isRead: false,
                    },
                });

                return {
                    user,
                    lastMessage,
                    unreadCount,
                };
            })
        );

        // Sort by last message time
        conversations.sort((a, b) => {
            const aTime = a.lastMessage?.createdAt || 0;
            const bTime = b.lastMessage?.createdAt || 0;
            return new Date(bTime) - new Date(aTime);
        });

        res.json({
            success: true,
            data: conversations,
        });
    } catch (error) {
        next(error);
    }
};

// Get messages with a specific user
const getMessages = async (req, res, next) => {
    try {
        const { userId: otherId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.user.id, receiverId: otherId },
                    { senderId: otherId, receiverId: req.user.id },
                ],
            },
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, avatar: true },
                },
            },
            orderBy: { createdAt: 'asc' },
            skip,
            take: parseInt(limit),
        });

        // Mark messages as read
        await prisma.message.updateMany({
            where: {
                senderId: otherId,
                receiverId: req.user.id,
                isRead: false,
            },
            data: { isRead: true },
        });

        res.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendMessage,
    getConversations,
    getMessages,
};
