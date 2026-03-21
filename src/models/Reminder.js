import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a reminder title'],
    },
    type: {
        type: String,
        enum: ['Medicine', 'Appointment', 'Exercise', 'Hydration', 'Other'],
        default: 'Other'
    },
    time: {
        type: Date,
        required: [true, 'Please add a reminder time']
    },
    repeat: {
        type: String,
        enum: ['None', 'Daily', 'Weekly', 'Monthly'],
        default: 'None'
    },
    completed: {
        type: Boolean,
        default: false
    },
    isAlarm: {
        type: Boolean,
        default: true
    },
    alarmSound: {
        type: String,
        default: 'default'
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
});

// Optimized indexes
reminderSchema.index({ userId: 1, time: 1 });
reminderSchema.index({ userId: 1, completed: 1 });

export default mongoose.model('Reminder', reminderSchema);
