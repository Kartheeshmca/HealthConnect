import HealthRecord from '../models/HealthRecord.js';

// @desc    Upload or add a health record
// @route   POST /api/records/upload
// @access  Private
export const uploadRecord = async (req, res, next) => {
    try {
        const { title, type, doctorName, hospitalName, notes, recordDate } = req.body;
        
        // Use req.file.path if file was uploaded via cloudinary middleware
        const finalFileUrl = req.file ? req.file.path : req.body.fileUrl;

        const record = await HealthRecord.create({
            userId: req.user.id,
            title,
            type,
            doctorName,
            hospitalName,
            fileUrl: finalFileUrl,
            notes,
            recordDate: recordDate ? new Date(recordDate) : Date.now(),
        });

        res.status(201).json({
            success: true,
            data: record
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all records for a user
// @route   GET /api/records/:userId
// @access  Private
// @note    Typically we use req.user.id, but relying on param for this requirement.
export const getRecordsByUser = async (req, res, next) => {
    try {
        // Find records and sort by recordDate descending
        const records = await HealthRecord.find({ userId: req.params.userId }).sort({ recordDate: -1 });

        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a health record
// @route   DELETE /api/records/:id
// @access  Private
export const deleteRecord = async (req, res, next) => {
    try {
        const record = await HealthRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        // Make sure user owns the record
        if (record.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this record' });
        }

        await record.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
