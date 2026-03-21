import mongoose from 'mongoose';

const healthLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    steps: {
        type: Number,
        default: 0
    },
    weight: {
        type: Number,
    },
    bloodPressure: {
        systolic: Number,
        diastolic: Number,
    },
    sugarLevel: {
        type: Number, // e.g., mg/dL
    },
    sleepHours: {
        type: Number,
    },
    waterIntake: {
        type: Number, // e.g., in ml or glasses
    },
    medicationTaken: {
        type: Boolean,
        default: false
    },
    mealsLogged: {
        type: Number, // Number of meals logged (e.g., 1 to 3)
        default: 0
    },
    activeMinutes: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

// Create compound index for userId and date to allow easy queries by date
healthLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model('HealthLog', healthLogSchema);
