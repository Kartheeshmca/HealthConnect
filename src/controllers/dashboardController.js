import HealthLog from '../models/HealthLog.js';
import Reminder from '../models/Reminder.js';
import Family from '../models/Family.js';
import HealthTip from '../models/HealthTip.js';
import Todo from '../models/Todo.js';
import User from '../models/User.js';
import { calculateHealthScore } from '../services/healthScoreService.js';

// @desc    Unified dashboard data — ONE request, all data
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userObjectId = req.user._id;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const now = new Date();

        // ─── Run ALL queries in parallel (no sequential awaits) ─────────────
        const [
            user,
            latestLog,
            todayStepsAgg,
            upcomingReminders,
            family,
            tips,
            pendingTodos,
            weeklyStepsAgg,
        ] = await Promise.all([
            User.findById(userId).select('name profileImage medicationEnabled dailyStepGoal').lean(),

            HealthLog.findOne({ userId }).sort({ date: -1 }).lean(),

            HealthLog.aggregate([
                { $match: { userId: userObjectId, date: { $gte: startOfDay } } },
                { $group: { _id: null, total: { $sum: '$steps' } } }
            ]),

            Reminder.find({
                userId,
                time: { $gte: now },
                completed: { $ne: true }
            }).sort({ time: 1 }).limit(5).lean(),

            Family.findOne({
                $or: [{ createdBy: userId }, { 'members.user': userId }]
            }).populate('members.user', 'name profileImage').lean(),

            HealthTip.aggregate([{ $sample: { size: 1 } }]),

            Todo.find({
                userId,
                completed: false,
                date: { $gte: startOfDay }
            }).sort({ date: 1 }).limit(10).lean(),

            HealthLog.aggregate([
                { $match: { userId: userObjectId, date: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } },
                { $group: { 
                    _id: { $dayOfWeek: "$date" }, 
                    total: { $sum: "$steps" } 
                } },
                { $sort: { "_id": 1 } }
            ]),
        ]);

        const todaySteps = todayStepsAgg?.[0]?.total ?? 0;

        // ─── Health Score ────────────────────────────────────────────────────
        let healthScore = 0;
        if (latestLog && user) {
            try {
                const scoreData = calculateHealthScore(latestLog, user);
                healthScore = scoreData.healthScore ?? 0;
            } catch (_) {}
        }

        // Map weekly stats (1=Sun...7=Sat) to (0=Mon...6=Sun)
        const weeklyStats = [0, 0, 0, 0, 0, 0, 0];
        (weeklyStepsAgg || []).forEach(item => {
            const dayIndex = (item._id + 5) % 7;
            weeklyStats[dayIndex] = item.total;
        });

        // ─── Family Leaderboard with REAL Scores ─────────────────────────────
        const memberScores = await Promise.all((family?.members ?? []).map(async (m) => {
            const memberUser = m.user;
            if (!memberUser || !memberUser._id) return null;

            // Fetch latest log for this member
            const memberLatestLog = await HealthLog.findOne({ userId: memberUser._id })
                .sort({ date: -1 })
                .lean();
            
            let mScore = 0;
            if (memberLatestLog) {
                try {
                    const sData = calculateHealthScore(memberLatestLog, memberUser);
                    mScore = sData.healthScore ?? 0;
                } catch (_) {}
            }

            return {
                _id: memberUser._id,
                name: memberUser.name,
                profileImage: memberUser.profileImage,
                score: mScore,
                joinedAt: m.joinedAt
            };
        }));

        const activeMembers = memberScores.filter(m => m !== null);

        res.status(200).json({
            success: true,
            data: {
                healthScore,
                steps: {
                    today: todaySteps,
                    goal: user?.dailyStepGoal ?? 10000,
                },
                weeklyStats,
                latestVitals: latestLog,
                upcomingReminders: upcomingReminders ?? [],
                tipOfTheDay: tips?.[0] ?? null,
                familyMembers: family?.members?.map(m => m.user) ?? [],
                familyName: family?.name ?? null,
                pendingTodos: pendingTodos ?? [],
                members: activeMembers,
            }
        });

    } catch (error) {
        next(error);
    }
};
