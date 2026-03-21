import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDailyNutrition, logMeal, logWater } from '../controllers/nutritionController.js';

const router = express.Router();

router.get('/', protect, getDailyNutrition);
router.post('/meal', protect, logMeal);
router.post('/water', protect, logWater);

export default router;
