import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    getAllProfiles,
    updateUserById,
    uploadProfileImage,
    updateFCMToken
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate, authValidators } from '../validators/index.js';
import { uploadProfile } from '../utils/upload.js';

const router = express.Router();

router.post('/register', validate(authValidators.register), registerUser);
router.post('/login', authLimiter, validate(authValidators.login), loginUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)
    .delete(protect, deleteUser);

router.put('/profile/:id', protect, updateUserById);

router.get('/profiles', protect, getAllProfiles);

router.post('/upload', protect, uploadProfile.single('image'), uploadProfileImage);
router.put('/fcm-token', protect, updateFCMToken);

export default router;
