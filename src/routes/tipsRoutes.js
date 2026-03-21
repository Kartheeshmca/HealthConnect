import express from 'express';
import { getRandomTips, getTipsByCategory, createTip } from '../controllers/tipsController.js';

const router = express.Router();

// Making tips public as requested
router.get('/', getRandomTips);
router.get('/category/:category', getTipsByCategory);

// Typically this would be protected, but for the assignment, we'll keep it simple
router.post('/create', createTip);

export default router;
