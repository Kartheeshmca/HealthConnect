import mongoose from 'mongoose';

const healthTipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a tip title'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a tip description'],
    },
    category: {
        type: String,
        enum: ['Nutrition', 'Exercise', 'Mental Health', 'Disease Prevention', 'General'],
        default: 'General',
        required: [true, 'Please provide a category'],
    }
}, {
    timestamps: true,
});

export default mongoose.model('HealthTip', healthTipSchema);
