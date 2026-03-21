import express from 'express';
import { getFamilyMessages, uploadChatImage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.get('/family/:familyId', protect, getFamilyMessages);
router.post('/upload', protect, upload.single('image'), uploadChatImage);

export default router;
