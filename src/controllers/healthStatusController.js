import HealthLog from '../models/HealthLog.js';
import User from '../models/User.js';
import Family from '../models/Family.js';
import { calculateHealthScore } from '../services/healthScoreService.js';

// @desc    Get health status for a user
// @route   GET /api/health/status/:userId
// @access  Private
export const getUserHealthStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Verify authorization
        if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to view this health status');
        }

        const user = await User.findById(userId);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Get the latest health log for the user
        const latestLog = await HealthLog.findOne({ userId }).sort({ date: -1 });

        if (!latestLog) {
            return res.json({
                success: true,
                data: {
                    healthScore: 0,
                    status: "No Data",
                    metrics: { steps: 0, sleep: 0, water: 0, bp: "0/0", sugar: 0, bmi: user.bmi || 0 },
                    alerts: ["No health data logged yet."],
                    recommendations: ["Log your first daily health metrics to get your health status!"]
                }
            });
        }

        const statusData = calculateHealthScore(latestLog, user);

        res.json({
            success: true,
            data: statusData
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get health status for all family members
// @route   GET /api/health/family-status/:familyId
// @access  Private
export const getFamilyHealthStatus = async (req, res, next) => {
    try {
        const { familyId } = req.params;

        // Find the family and populate members.user
        const family = await Family.findById(familyId).populate({
            path: 'members.user',
            select: 'name bmi'
        });

        if (!family) {
            res.status(404);
            throw new Error('Family not found');
        }

        // Optional: Check if the requester is part of this family
        const isMember = family.members.some(member => member.user._id.toString() === req.user._id.toString());
        if (!isMember && req.user.role !== 'admin') {
             res.status(403);
             throw new Error('Not authorized to view this family\'s health status');
        }

        const familyStatuses = [];

        for (const member of family.members) {
            const memberUser = member.user;
            if (memberUser) {
                const latestLog = await HealthLog.findOne({ userId: memberUser._id }).sort({ date: -1 });
                
                let healthScore = 0;
                let status = "No Data";
                let metrics = { bmi: memberUser.bmi || 0 };

                if (latestLog) {
                    const statusData = calculateHealthScore(latestLog, memberUser);
                    healthScore = statusData.healthScore;
                    status = statusData.status;
                    metrics = statusData.metrics;
                }

                familyStatuses.push({
                    name: memberUser.name,
                    healthScore,
                    medication_enabled: statusData.medication_enabled || false,
                    breakdown: statusData.breakdown || {},
                    status,
                    bmi: memberUser.bmi || metrics.bmi || 0,
                    metrics
                });
            }
        }

        res.json({
            success: true,
            data: familyStatuses
        });

    } catch (error) {
        next(error);
    }
};
