import DoctorAccess from '../models/DoctorAccess.js';
import User from '../models/User.js';
import HealthData from '../models/HealthData.js';
import HealthLog from '../models/HealthLog.js';
import logger from '../utils/logger.js';

// @desc    Get list of all doctors
// @route   GET /api/doctor/list
// @access  Private
export const getDoctors = async (req, res, next) => {
    try {
        const doctors = await User.find({ role: 'doctor', isActive: true, isDeleted: false })
            .select('name profileImage email phoneNumber')
            .lean();

        res.status(200).json({
            success: true,
            data: doctors
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Grant/Update access to a doctor
// @route   POST /api/doctor/share
// @access  Private
export const shareWithDoctor = async (req, res, next) => {
    try {
        const { doctorId, status = 'active' } = req.body;
        const userId = req.user.id;

        // Verify doctor exists
        const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        const access = await DoctorAccess.findOneAndUpdate(
            { userId, doctorId },
            { status },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: status === 'active' ? 'Access granted to doctor' : 'Access revoked',
            data: access
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get doctors that user has shared data with
// @route   GET /api/doctor/my-doctors
// @access  Private
export const getMySharedDoctors = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const accessList = await DoctorAccess.find({ userId })
            .populate('doctorId', 'name profileImage email phoneNumber')
            .lean();

        res.status(200).json({
            success: true,
            data: accessList
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all patients shared with this doctor
// @route   GET /api/doctor/patients
// @access  Private
export const getDoctorPatients = async (req, res, next) => {
    try {
        const doctorId = req.user.id;

        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Access denied: not a doctor' });
        }

        const patients = await DoctorAccess.find({ doctorId, status: 'active' })
            .populate('userId', 'name profileImage age gender dateOfBirth height weight bmi phoneNumber')
            .lean();

        res.status(200).json({
            success: true,
            data: patients.map(p => ({
                id: p.userId._id,
                name: p.userId.name,
                profileImage: p.userId.profileImage,
                age: p.userId.age,
                gender: p.userId.gender,
                bloodGroup: p.userId.bloodGroup || '', // fallback
                grantedAt: p.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get patient health data (Doctor only)
// @route   GET /api/doctor/patient/:patientId/health
// @access  Private
export const getPatientHealthData = async (req, res, next) => {
    try {
        const doctorId = req.user.id;
        const patientId = req.params.patientId;

        if (req.user.role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Access denied: not a doctor' });
        }

        // Verify active consent
        const access = await DoctorAccess.findOne({ doctorId, userId: patientId, status: 'active' });
        if (!access) {
            return res.status(403).json({ success: false, message: 'Access to this patient is revoked or unassigned' });
        }

        const limit = parseInt(req.query.limit) || 30; // default 30 days history

        // Use Promise.all to fetch both native health data and manual logs concurrently
        const [nativeHealthData, manualLogs] = await Promise.all([
            HealthData.find({ userId: patientId }).sort({ date: -1 }).limit(limit).lean(),
            HealthLog.find({ userId: patientId }).sort({ date: -1 }).limit(limit).lean()
        ]);

        res.status(200).json({
            success: true,
            data: {
                nativeHealthData,
                manualLogs
            }
        });
    } catch (error) {
        next(error);
    }
};
