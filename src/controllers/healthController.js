import HealthLog from '../models/HealthLog.js';

// @desc    Add a health log entry
// @route   POST /api/health/add
// @access  Private
export const addHealthLog = async (req, res, next) => {
    try {
        const { steps, weight, bloodPressure, sugarLevel, sleepHours, waterIntake, date } = req.body;

        const log = await HealthLog.create({
            userId: req.user._id,
            steps,
            weight,
            bloodPressure,
            sugarLevel,
            sleepHours,
            waterIntake,
            date: date || Date.now()
        });

        res.status(201).json({
            success: true,
            data: log
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get health history for a user
// @route   GET /api/health/history/:userId
// @access  Private
export const getHealthHistory = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const page = parseInt(req.query.page, 10) || 1;
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50); // cap at 50
        const startIndex = (page - 1) * limit;

        // Authorization check: Self, Admin, or Family Member
        if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
            const Family = (await import('../models/Family.js')).default;
            const isFamilyMember = await Family.findOne({
                $and: [
                    { $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }] },
                    { $or: [{ createdBy: userId }, { 'members.user': userId }] }
                ]
            });

            if (!isFamilyMember) {
                res.status(403);
                throw new Error('Not authorized to view this data. You must be in the same family.');
            }
        }

        // Limit to last 30 days for performance
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [logs, total] = await Promise.all([
            HealthLog.find({ userId, date: { $gte: thirtyDaysAgo } })
                .sort({ date: -1 })
                .skip(startIndex)
                .limit(limit)
                .lean(), // raw JS objects — faster than Mongoose documents
            HealthLog.countDocuments({ userId, date: { $gte: thirtyDaysAgo } }),
        ]);

        res.json({
            success: true,
            count: logs.length,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            data: logs
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a health log
// @route   DELETE /api/health/delete/:id
// @access  Private
export const deleteHealthLog = async (req, res, next) => {
    try {
        const log = await HealthLog.findById(req.params.id);

        if (!log) {
            res.status(404);
            throw new Error('Log not found');
        }

        // Ensure user owns log or admin
        if (log.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to delete this log');
        }

        await log.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a health log
// @route   PUT /api/health/update/:id
// @access  Private
export const updateHealthLog = async (req, res, next) => {
    try {
        let log = await HealthLog.findById(req.params.id);

        if (!log) {
            res.status(404);
            throw new Error('Log not found');
        }

        if (log.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to update this log');
        }

        log = await HealthLog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: log });
    } catch (error) {
        next(error);
    }
};

// @desc    Get health logs for analytics (own user, by limit in days)
// @route   GET /api/health/logs
// @access  Private
export const getHealthLogs = async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 30, 90);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - limit);

        const logs = await HealthLog.find({
            userId: req.user._id,
            date: { $gte: startDate }
        })
            .sort({ date: 1 })
            .lean();

        res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        next(error);
    }
};
