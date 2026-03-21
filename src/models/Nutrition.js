import mongoose from 'mongoose';

const nutritionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    targetCalories: {
        type: Number,
        default: 2000
    },
    targetWaterMl: {
        type: Number,
        default: 2500
    },
    waterIntakeMl: {
        type: Number,
        default: 0
    },
    meals: [{
        name: String, // e.g., "Breakfast", "Apple"
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
        time: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true,
});

export default mongoose.model('Nutrition', nutritionSchema);
