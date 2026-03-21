import EmergencyAlert from '../models/EmergencyAlert.js';
import Family from '../models/Family.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

// @desc    Trigger SOS alert
// @route   POST /api/emergency/sos
// @access  Private
export const triggerSOS = async (req, res, next) => {
    try {
        const { latitude, longitude, message, timestamp } = req.body;
        const userId = req.user.id;

        // Find the family the user belongs to
        // Either they created it or they are a member
        const family = await Family.findOne({
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        });

        if (!family) {
            return res.status(404).json({ success: false, message: 'User is not part of any family' });
        }

        // Create the EmergencyAlert record
        const alert = await EmergencyAlert.create({
            userId,
            familyId: family._id,
            location: { latitude, longitude },
            message: message || 'SOS Emergency Alert Triggered',
        });

        // Notify all family members
        const notifications = [];
        
        // Add creator if it's not the user
        if (family.createdBy.toString() !== userId.toString()) {
            notifications.push({
                userId: family.createdBy,
                type: 'Alert',
                message: alert.message,
                read: false,
                timestamp: timestamp || new Date()
            });
        }

        // Add other members
        family.members.forEach(member => {
            if (member.user.toString() !== userId.toString()) {
                notifications.push({
                    userId: member.user,
                    type: 'Alert',
                    message: alert.message,
                    read: false,
                    timestamp: timestamp || new Date()
                });
            }
        });

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        // Real-time broadcast via Socket.IO
        const io = req.app.get('io');
        const sender = await User.findById(userId).select('name');
        
        // Create a chat message for the SOS
        let chatMessage = message || 'SOS Emergency Alert Triggered!';
        if (latitude && longitude) {
            chatMessage += `\n📍 My Location: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        }

        const newMessage = await Message.create({
            senderId: userId,
            familyId: family._id,
            message: chatMessage,
            messageType: 'text',
            timestamp: new Date()
        });

        if (io) {
            // Emit SOS receive for the emergency overlay
            io.to(family._id.toString()).emit('sos_receive', {
                alertId: alert._id,
                sender: {
                    _id: userId,
                    name: sender.name
                },
                location: alert.location,
                message: alert.message,
                timestamp: alert.createdAt
            });

            // Emit receive_message for the chat update
            io.to(family._id.toString()).emit('receive_message', {
                ...newMessage.toObject(),
                senderId: {
                    _id: userId,
                    name: sender.name
                }
            });
        }

        res.status(201).json({
            success: true,
            data: alert
        });
    } catch (error) {
        next(error);
    }
};
