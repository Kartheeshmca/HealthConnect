import mongoose from 'mongoose';

const healthDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    steps: {
        type: Number,
        default: 0
    },
    heartRate: {
        type: Number, // bpm
    },
    sleepMinutes: {
        type: Number,
    },
    distance: {
        type: Number, // meters
    },
    activeEnergyBurned: {
        type: Number, // calories
    },
    isSyncedFromNative: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

// Create compound index for userId and date to allow easy queries by date
healthDataSchema.index({ userId: 1, date: -1 });

export default mongoose.model('HealthData', healthDataSchema);
