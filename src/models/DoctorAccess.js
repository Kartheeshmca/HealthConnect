import mongoose from 'mongoose';

const doctorAccessSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    doctorId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'revoked'],
        default: 'active'
    },
    permissions: {
        canViewLogs: { type: Boolean, default: true },
        canViewAnalytics: { type: Boolean, default: true }
    }
}, {
    timestamps: true,
});

// Ensure a user can only grant access to a specific doctor once (active or pending)
doctorAccessSchema.index({ userId: 1, doctorId: 1 }, { unique: true });

export default mongoose.model('DoctorAccess', doctorAccessSchema);
