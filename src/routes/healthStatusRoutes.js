import express from 'express';
import { getUserHealthStatus, getFamilyHealthStatus } from '../controllers/healthStatusController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/status/:userId', getUserHealthStatus);
router.get('/family-status/:familyId', getFamilyHealthStatus);

export default router;
