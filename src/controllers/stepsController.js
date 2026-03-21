import HealthLog from '../models/HealthLog.js';

// @desc    Update daily steps for user
// @route   POST /api/steps/update
// @access  Private
export const updateSteps = async (req, res, next) => {
    try {
        const { steps } = req.body;

        // Find if a HealthLog already exists for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let healthLog = await HealthLog.findOne({
            userId: req.user._id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (healthLog) {
            // Update existing log
            healthLog.steps = (healthLog.steps || 0) + steps;
            await healthLog.save();
        } else {
            // Create new log with steps
            healthLog = await HealthLog.create({
                userId: req.user._id,
                steps,
                date: new Date()
            });
        }

        res.status(200).json({
            success: true,
            data: healthLog
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get steps history for current user
// @route   GET /api/steps/:userId
// @access  Private
export const getStepsHistory = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to view these steps');
        }

        // Usually we might just fetch HealthLogs and select steps
        const logs = await HealthLog.find({ userId })
            .select('steps date')
            .sort({ date: -1 })
            .limit(30); // Last 30 days

        res.json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a steps log
// @route   DELETE /api/steps/delete/:id
// @access  Private
export const deleteStepsLog = async (req, res, next) => {
    try {
        const log = await HealthLog.findById(req.params.id);

        if (!log) {
            res.status(404);
            throw new Error('Log not found');
        }

        if (log.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to delete this log');
        }

        await log.deleteOne();

        res.json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};


