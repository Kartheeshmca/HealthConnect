import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { addMedication, getMedications, logMedication } from '../controllers/medicationController.js';

const router = express.Router();

router.post('/', protect, addMedication);
router.get('/', protect, getMedications);
router.post('/:medicationId/log', protect, logMedication);

export default router;
