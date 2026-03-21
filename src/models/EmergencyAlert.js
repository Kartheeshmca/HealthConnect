import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    familyId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Family',
        required: true,
    },
    location: {
        latitude: Number,
        longitude: Number,
    },
    message: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

export default mongoose.model('EmergencyAlert', emergencyAlertSchema);
