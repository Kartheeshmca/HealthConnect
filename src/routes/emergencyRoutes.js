import express from 'express';
import { triggerSOS } from '../controllers/emergencyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/sos', triggerSOS);

export default router;
