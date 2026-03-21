import Nutrition from '../models/Nutrition.js';

// Helper to get start and end of day
const getDayRange = (dateString) => {
    const d = dateString ? new Date(dateString) : new Date();
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end = new Date(d.setHours(23, 59, 59, 999));
    return { start, end };
};

// @desc Get daily nutrition stats
export const getDailyNutrition = async (req, res, next) => {
    try {
        const { date } = req.query; // optional specific date
        const { start, end } = getDayRange(date);

        let nutrition = await Nutrition.findOne({
            userId: req.user.id,
            date: { $gte: start, $lte: end }
        });

        // Create if doesn't exist for today
        if (!nutrition) {
            nutrition = await Nutrition.create({
                userId: req.user.id,
                date: new Date()
            });
        }

        res.status(200).json({ success: true, data: nutrition });
    } catch (error) {
        next(error);
    }
};

// @desc Log a meal
export const logMeal = async (req, res, next) => {
    try {
        const { date, meal } = req.body;
        const { start, end } = getDayRange(date);

        let nutrition = await Nutrition.findOne({
            userId: req.user.id,
            date: { $gte: start, $lte: end }
        });

        if (!nutrition) {
            nutrition = new Nutrition({ userId: req.user.id, date: new Date(date || new Date()) });
        }

        nutrition.meals.push(meal);
        await nutrition.save();

        res.status(200).json({ success: true, data: nutrition });
    } catch (error) {
        next(error);
    }
};

// @desc Log water intake
export const logWater = async (req, res, next) => {
    try {
        const { date, amountMl } = req.body;
        const { start, end } = getDayRange(date);

        const nutrition = await Nutrition.findOneAndUpdate(
            { userId: req.user.id, date: { $gte: start, $lte: end } },
            { $inc: { waterIntakeMl: amountMl } },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: nutrition });
    } catch (error) {
        next(error);
    }
};
