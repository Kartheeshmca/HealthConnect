import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add a phone number'],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false, // Don't return password by default
    },
    age: {
        type: Number,
        // Making age optional in favor of dateOfBirth, but kept for compatibility
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    address: {
        city: String,
        state: String,
    },
    emergencyContact: [{
        name: String,
        phoneNumber: String,
        relation: String,
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: null
    },
    height: {
        type: Number,
        required: false, // height in cm
    },
    weight: {
        type: Number,
        required: false, // weight in kg
    },
    bmi: {
        type: Number,
        required: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'doctor'],
        default: 'user',
    },
    profileImage: {
        type: String,
        default: ''
    },
    medicationTrackingEnabled: {
        type: Boolean,
        default: false
    },
    dailyStepGoal: {
        type: Number,
        default: 10000
    },
    fcmToken: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Calculate BMI on save if height and weight exist
userSchema.pre('save', function (next) {
    if (this.isModified('height') || this.isModified('weight')) {
        if (this.height && this.weight) {
            // BMI = weight(kg) / (height(m))^2
            const heightInMeters = this.height / 100;
            this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(2));
        }
    }
    next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
