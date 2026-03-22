import EmergencyAlert from '../models/EmergencyAlert.js';
import Family from '../models/Family.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { sendPushNotification } from '../services/fcmService.js';

// @desc    Trigger SOS alert
// @route   POST /api/emergency/sos
// @access  Private
export const triggerSOS = async (req, res, next) => {
    try {
        const { latitude, longitude, message, timestamp } = req.body;
        const userId = req.user.id;

        // Find the family the user belongs to
        const family = await Family.findOne({
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        }).populate('createdBy', 'name fcmToken').populate('members.user', 'name fcmToken');

        if (!family) {
            return res.status(404).json({ success: false, message: 'User is not part of any family' });
        }

        const sender = await User.findById(userId).select('name');

        // Create the EmergencyAlert record
        const alert = await EmergencyAlert.create({
            userId,
            familyId: family._id,
            location: { latitude, longitude },
            message: message || `SOS Emergency Alert Triggered by ${sender.name}`,
        });

        // Notify all family members
        const notifications = [];
        const pushTokens = [];
        
        // Add creator if it's not the user
        if (family.createdBy._id.toString() !== userId.toString()) {
            notifications.push({
                userId: family.createdBy._id,
                type: 'Alert',
                message: alert.message,
                read: false,
                timestamp: timestamp || new Date()
            });
            if (family.createdBy.fcmToken) pushTokens.push(family.createdBy.fcmToken);
        }

        // Add other members
        family.members.forEach(member => {
            if (member.user && member.user._id.toString() !== userId.toString()) {
                notifications.push({
                    userId: member.user._id,
                    type: 'Alert',
                    message: alert.message,
                    read: false,
                    timestamp: timestamp || new Date()
                });
                if (member.user.fcmToken) pushTokens.push(member.user.fcmToken);
            }
        });

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        // Send push notifications via FCM
        if (pushTokens.length > 0) {
            const pushTitle = '🚨 EMERGENCY ALERT';
            const pushBody = `${sender.name} needs immediate assistance!`;
            const pushData = {
                type: 'SOS_ALERT',
                alertId: alert._id.toString(),
                latitude: latitude?.toString() || '',
                longitude: longitude?.toString() || '',
                senderName: sender.name,
                message: alert.message
            };

            for (const token of pushTokens) {
                try {
                    await sendPushNotification(token, pushTitle, pushBody, pushData);
                } catch (err) {
                    console.error('FCM send error for token:', token, err);
                }
            }
        }

        // Real-time broadcast via Socket.IO
        const io = req.app.get('io');
        
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
