import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a title for the record'],
    },
    type: {
        type: String,
        enum: ['Prescription', 'Lab Report', 'Scan', 'Vaccination', 'Other'],
        required: [true, 'Please provide a record type'],
    },
    doctorName: {
        type: String,
    },
    hospitalName: {
        type: String,
    },
    fileUrl: {
        type: String,
    },
    notes: {
        type: String,
    },
    recordDate: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

export default mongoose.model('HealthRecord', healthRecordSchema);
