import Medication from '../models/Medication.js';

// @desc Add new medication
export const addMedication = async (req, res, next) => {
    try {
        const { name, dosage, frequency, times, inventory } = req.body;
        const medication = await Medication.create({
            userId: req.user.id,
            name,
            dosage,
            frequency,
            times,
            inventory
        });
        res.status(201).json({ success: true, data: medication });
    } catch (error) {
        next(error);
    }
};

// @desc Get active medications for user
export const getMedications = async (req, res, next) => {
    try {
        const meds = await Medication.find({ userId: req.user.id, isActive: true }).sort('-createdAt');
        res.status(200).json({ success: true, data: meds });
    } catch (error) {
        next(error);
    }
};

// @desc Log a medication as taken
export const logMedication = async (req, res, next) => {
    try {
        const { medicationId } = req.params;
        const { status } = req.body; // 'taken', 'missed', 'skipped'

        const med = await Medication.findById(medicationId);
        if (!med || med.userId.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Medication not found' });
        }

        med.logs.push({
            date: new Date(),
            takenAt: new Date(),
            status
        });

        if (status === 'taken' && med.inventory.remaining > 0) {
            med.inventory.remaining -= 1;
        }

        const updated = await med.save();
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};
