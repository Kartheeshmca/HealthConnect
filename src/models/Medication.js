import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    dosage: {
        type: String,
        required: true, // e.g., "500mg" or "1 tablet"
    },
    frequency: {
        type: String,
        required: true, // e.g., "Daily", "Twice a day", "Weekly"
    },
    times: [{
        time: String, // e.g., "08:00 AM"
    }],
    inventory: {
        total: {
            type: Number,
            default: 30
        },
        remaining: {
            type: Number,
            default: 30
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    logs: [{
        date: Date,
        takenAt: Date,
        status: {
            type: String,
            enum: ['taken', 'missed', 'skipped'],
            default: 'taken'
        }
    }]
}, {
    timestamps: true,
});

export default mongoose.model('Medication', medicationSchema);
