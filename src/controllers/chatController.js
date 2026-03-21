import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get messages for a family
// @route   GET /api/chat/family/:familyId
// @access  Private
export const getFamilyMessages = async (req, res, next) => {
    try {
        const { familyId } = req.params;
        const userId = req.user.id;

        // Ensure the requester is a member of the family
        const Family = (await import('../models/Family.js')).default;
        const family = await Family.findOne({
            _id: familyId,
            $or: [
                { createdBy: userId },
                { 'members.user': userId }
            ]
        });

        if (!family) {
            return res.status(403).json({ success: false, message: 'Access denied: not a member of this family' });
        }

        const messages = await Message.find({ familyId })
            .populate('senderId', 'name phoneNumber profileImage')
            .sort({ timestamp: 1 });

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload image to chat
// @route   POST /api/chat/upload
// @access  Private
export const uploadChatImage = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload an image');
        }

        // When using Cloudinary, req.file.path contains the secure URL
        const imageUrl = req.file.path;

        res.json({
            success: true,
            data: imageUrl
        });
    } catch (error) {
        next(error);
    }
};
