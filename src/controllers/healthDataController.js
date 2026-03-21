import HealthData from '../models/HealthData.js';
import logger from '../utils/logger.js';

// @desc    Store summarizing user health data
// @route   POST /api/health-data
// @access  Private
export const syncHealthData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const healthRecords = req.body.data; // Array of health entries

        if (!healthRecords || !Array.isArray(healthRecords)) {
            return res.status(400).json({ success: false, message: 'Invalid data format. Expected an array of records.' });
        }

        // Upsert each record
        const bulkOps = healthRecords.map(record => ({
            updateOne: {
                filter: { userId, date: new Date(record.date) },
                update: { $set: { ...record, userId } },
                upsert: true
            }
        }));

        if (bulkOps.length > 0) {
            await HealthData.bulkWrite(bulkOps);
        }

        res.status(200).json({
            success: true,
            message: 'Health data synced successfully',
            count: bulkOps.length
        });
    } catch (error) {
        logger.error(`Error syncing health data: ${error.message}`);
        next(error);
    }
};

// @desc    Fetch user's health data (with optional family access)
// @route   GET /api/health-data
// @access  Private
export const getHealthData = async (req, res, next) => {
    try {
        const userId = req.query.userId || req.user.id;

        // Access control if req.query.userId !== req.user.id (check if family)
        if (userId !== req.user.id) {
            const Family = (await import('../models/Family.js')).default;
            // Check if there is any family where both user and the queried user are members
            const sharedFamily = await Family.findOne({
                $and: [
                    { $or: [{ createdBy: req.user.id }, { 'members.user': req.user.id }] },
                    { $or: [{ createdBy: userId }, { 'members.user': userId }] }
                ]
            });

            if (!sharedFamily) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this user\'s health data' });
            }
        }

        const limit = parseInt(req.query.limit) || 7; // Default past 7 days

        const healthData = await HealthData.find({ userId })
            .sort({ date: -1 })
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            count: healthData.length,
            data: healthData
        });
    } catch (error) {
        next(error);
    }
};
