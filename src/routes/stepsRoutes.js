import express from 'express';
import { updateSteps, getStepsHistory, deleteStepsLog } from '../controllers/stepsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, healthValidators } from '../validators/index.js';
// Reusing health validation for steps or we could add specific steps validation
import Joi from 'joi';
const stepValidators = {
    update: Joi.object({
        steps: Joi.number().required()
    })
};

const router = express.Router();

router.post('/update', protect, validate(stepValidators.update), updateSteps);
router.get('/:userId', protect, getStepsHistory);
router.delete('/delete/:id', protect, deleteStepsLog);

export default router;
