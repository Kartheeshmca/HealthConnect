import express from 'express';
import { uploadRecord, getRecordsByUser, deleteRecord } from '../controllers/recordsController.js';
import { protect } from '../middleware/authMiddleware.js';

import { uploadRecord as uploadRecordMiddleware } from '../utils/upload.js';

const router = express.Router();

// Apply auth middleware to all records routes
router.use(protect);

router.post('/upload', uploadRecordMiddleware.single('file'), uploadRecord);
router.get('/:userId', getRecordsByUser);
router.delete('/:id', deleteRecord);

export default router;
