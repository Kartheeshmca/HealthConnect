import Message from '../models/Message.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const initializeChatSocket = (io) => {
    io.on('connection', (socket) => {
        logger.info(`User connected to socket: ${socket.id}`);

        // Handle user authentication / registration on socket to set status to online
        socket.on('register_user', async (userId) => {
            if (userId) {
                socket.userId = userId;
                try {
                    await User.findByIdAndUpdate(userId, { isOnline: true, lastLogin: new Date() });
                    logger.info(`User ${userId} registered online on socket ${socket.id}`);
                } catch (error) {
                    logger.error('Error updating user status on connect:', error);
                }
            }
        });

        // Join a specific room (e.g., family ID or direct chat ID)
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            logger.info(`User ${socket.id} joined room: ${roomId}`);
        });

        // Handle sending a message
        socket.on('send_message', async (data) => {
            const { familyId, message, messageType, imageUrl, audioUrl, documentUrl, fileName } = data;

            // Prefer authenticated socket userId, fallback to payload but only if missing (should not happen if client is well behaved)
            const senderId = socket.userId || data.senderId;

            try {
                // Access Control: Check if sender is in the family
                const Family = (await import('../models/Family.js')).default;
                const family = await Family.findOne({
                    _id: familyId,
                    $or: [
                        { createdBy: senderId },
                        { 'members.user': senderId }
                    ]
                });

                if (!family) {
                    logger.warn(`Unauthorized message attempt from ${senderId} to family ${familyId}`);
                    return socket.emit('error', 'Not a member of this family');
                }

                // Save message to database
                const newMessage = await Message.create({
                    senderId,
                    familyId,
                    message,
                    messageType: messageType || 'text',
                    imageUrl,
                    audioUrl,
                    documentUrl,
                    fileName
                });

                // Fetch sender info for UI
                const sender = await User.findById(senderId).select('name');

                // Broadcast to the room
                const roomId = familyId; // Room is the family ID
                io.to(roomId).emit('receive_message', {
                    _id: newMessage._id,
                    senderId: {
                        _id: sender._id,
                        name: sender.name
                    },
                    familyId,
                    message,
                    messageType: newMessage.messageType,
                    imageUrl: newMessage.imageUrl,
                    audioUrl: newMessage.audioUrl,
                    documentUrl: newMessage.documentUrl,
                    fileName: newMessage.fileName,
                    timestamp: newMessage.timestamp
                });

            } catch (error) {
                logger.error('Error saving message from socket', error);
                socket.emit('error', 'Error sending message');
            }
        });

        // Handle deleting a message
        socket.on('delete_message', async (data) => {
            const { messageId, familyId } = data;
            try {
                const message = await Message.findById(messageId);
                if (message) {
                    message.isDeleted = true;
                    message.message = 'This message was deleted';
                    await message.save();

                    io.to(familyId).emit('message_deleted', { messageId });
                }
            } catch (error) {
                logger.error('Error deleting message from socket', error);
            }
        });

        // Typing indicators
        socket.on('typing', (data) => {
            socket.to(data.roomId).emit('user_typing', { userId: data.userId });
        });

        socket.on('stop_typing', (data) => {
            socket.to(data.roomId).emit('user_stopped_typing', { userId: data.userId });
        });

        socket.on('disconnect', async () => {
            logger.info(`User disconnected: ${socket.id}`);
            if (socket.userId) {
                try {
                    await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastLogin: new Date() });
                    logger.info(`User ${socket.userId} offline`);
                } catch (error) {
                    logger.error('Error updating user status on disconnect:', error);
                }
            }
        });
    });
};

export default initializeChatSocket;
