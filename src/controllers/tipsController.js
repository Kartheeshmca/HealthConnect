import HealthTip from '../models/HealthTip.js';

// @desc    Get random health tips
// @route   GET /api/tips
// @access  Public or Private
export const getRandomTips = async (req, res, next) => {
    try {
        // Fetch random tips using aggregation
        const tips = await HealthTip.aggregate([{ $sample: { size: 5 } }]);

        res.status(200).json({
            success: true,
            count: tips.length,
            data: tips
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get tips by category
// @route   GET /api/tips/category/:category
// @access  Public or Private
export const getTipsByCategory = async (req, res, next) => {
    try {
        const category = req.params.category;
        const tips = await HealthTip.find({ category });

        res.status(200).json({
            success: true,
            count: tips.length,
            data: tips
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new health tip
// @route   POST /api/tips/create
// @access  Private/Admin
export const createTip = async (req, res, next) => {
    try {
        const { title, description, category } = req.body;

        const tip = await HealthTip.create({
            title,
            description,
            category: category || 'General'
        });

        res.status(201).json({
            success: true,
            data: tip
        });
    } catch (error) {
        next(error);
    }
};
