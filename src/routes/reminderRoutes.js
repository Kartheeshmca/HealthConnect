import express from 'express';
import { createReminder, getReminders, updateReminder, deleteReminder, toggleCompleteReminder } from '../controllers/reminderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, reminderValidators } from '../validators/index.js';

const router = express.Router();

router.post('/create', protect, validate(reminderValidators.create), createReminder);
router.get('/:userId', protect, getReminders);
router.put('/update/:id', protect, validate(reminderValidators.update), updateReminder);
router.patch('/complete/:id', protect, toggleCompleteReminder);
router.delete('/delete/:id', protect, deleteReminder);

export default router;
