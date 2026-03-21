import express from 'express';
import {
    createFamily,
    addMember,
    getFamily,
    updateFamily,
    deleteFamily,
    removeMember,
    getAllFamilies
} from '../controllers/familyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate, familyValidators } from '../validators/index.js';

const router = express.Router();

router.get('/getall', getAllFamilies);


router.post('/create', protect, validate(familyValidators.create), createFamily);
router.post('/add-member', protect, validate(familyValidators.addMember), addMember);
router.post('/remove-member', protect, removeMember); // Could add validation here too
router.route('/:familyId')
    .get(protect, getFamily)
    .put(protect, updateFamily)
    .delete(protect, deleteFamily);

export default router;
