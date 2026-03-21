import express from 'express';
import { syncHealthData, getHealthData } from '../controllers/healthDataController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../validators/index.js';
import Joi from 'joi';

const router = express.Router();

// Define Joi schema here if not in validators/index.js for brevity
const syncSchema = Joi.object({
    data: Joi.array().items(
        Joi.object({
            date: Joi.date().iso().required(),
            steps: Joi.number().optional(),
            heartRate: Joi.number().optional(),
            sleepMinutes: Joi.number().optional(),
            distance: Joi.number().optional(),
            activeEnergyBurned: Joi.number().optional(),
        })
    ).required()
});

router.post('/', protect, validate(syncSchema), syncHealthData);
router.get('/', protect, getHealthData);

export default router;
