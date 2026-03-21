import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    // For individual chat or family group chat
    familyId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Family',
        required: false,
    },
    receiverId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false,
    },
    message: {
        type: String,
        required: function() {
            return this.messageType === 'text';
        },
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'document', 'audio'],
        default: 'text',
    },
    imageUrl: {
        type: String,
        required: false
    },
    audioUrl: {
        type: String,
        required: false
    },
    documentUrl: {
        type: String,
        required: false
    },
    fileName: {
        type: String,
        required: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

messageSchema.index({ familyId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ timestamp: -1 });

export default mongoose.model('Message', messageSchema);
