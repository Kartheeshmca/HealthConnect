import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a todo title'],
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        required: [true, 'Please add a date'],
    },
    completed: {
        type: Boolean,
        default: false,
    },
    isReminder: {
        type: Boolean,
        default: false,
    },
    reminderTime: {
        type: Date,
    },
    isDaily: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
    }
}, {
    timestamps: true,
});

// Optimized indexes
todoSchema.index({ userId: 1, date: 1 });
todoSchema.index({ userId: 1, completed: 1 });

export default mongoose.model('Todo', todoSchema);
