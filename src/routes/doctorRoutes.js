import express from 'express';
import { getDoctors, shareWithDoctor, getMySharedDoctors, getDoctorPatients, getPatientHealthData } from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/list', protect, getDoctors);
router.post('/share', protect, shareWithDoctor);
router.get('/my-doctors', protect, getMySharedDoctors);

// Doctor-only routes
router.get('/patients', protect, getDoctorPatients);
router.get('/patient/:patientId/health', protect, getPatientHealthData);

export default router;
