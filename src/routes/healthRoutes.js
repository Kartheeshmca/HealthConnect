import express from 'express';
import { addHealthLog, getHealthHistory, deleteHealthLog, updateHealthLog, getHealthLogs } from '../controllers/healthController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, healthValidators } from '../validators/index.js';

const router = express.Router();

router.post('/add', protect, validate(healthValidators.add), addHealthLog);
router.get('/history/:userId', protect, getHealthHistory);
router.get('/logs', protect, getHealthLogs);
router.put('/update/:id', protect, validate(healthValidators.add), updateHealthLog);
router.delete('/delete/:id', protect, deleteHealthLog);

export default router;
