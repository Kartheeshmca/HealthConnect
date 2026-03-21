import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, phoneNumber, password, age, dateOfBirth, gender, address, emergencyContact, role, height, weight, profileImage } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            phoneNumber,
            password,
            age,
            dateOfBirth,
            gender,
            address,
            emergencyContact,
            role,
            height,
            weight,
            profileImage: profileImage || ''
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    address: user.address,
                    emergencyContact: user.emergencyContact,
                    role: user.role,
                    isActive: user.isActive,
                    isDeleted: user.isDeleted,
                    isOnline: user.isOnline,
                    lastLogin: user.lastLogin,
                    height: user.height,
                    weight: user.weight,
                    bmi: user.bmi,
                    dailyStepGoal: user.dailyStepGoal
                }
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
    try {
        const { email, phoneNumber, password } = req.body;

        // Check for user email or phoneNumber
        const query = {};
        if (email) query.email = email;
        else if (phoneNumber) query.phoneNumber = phoneNumber;

        const user = await User.findOne(query).select('+password');

        if (user && (await user.matchPassword(password))) {

            user.lastLogin = new Date();
            user.isOnline = true;
            await user.save();

            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    isActive: user.isActive,
                    isDeleted: user.isDeleted,
                    isOnline: user.isOnline,
                    lastLogin: user.lastLogin,
                    height: user.height,
                    weight: user.weight,
                    bmi: user.bmi,
                    dailyStepGoal: user.dailyStepGoal,
                    profileImage: user.profileImage || '',
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        // req.user is set in auth middleware
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    age: user.age,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    address: user.address,
                    emergencyContact: user.emergencyContact,
                    role: user.role,
                    isActive: user.isActive,
                    isDeleted: user.isDeleted,
                    isOnline: user.isOnline,
                    lastLogin: user.lastLogin,
                    height: user.height,
                    weight: user.weight,
                    bmi: user.bmi
                }
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.age = req.body.age || user.age;
            user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
            user.gender = req.body.gender || user.gender;

            if (req.body.address) {
                user.address = { ...user.address, ...req.body.address };
            }
            if (req.body.emergencyContact) {
                user.emergencyContact = req.body.emergencyContact;
            }

            user.height = req.body.height || user.height;
            user.weight = req.body.weight || user.weight;
            user.profileImage = req.body.profileImage || user.profileImage;
            user.dailyStepGoal = req.body.dailyStepGoal || user.dailyStepGoal;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phoneNumber: updatedUser.phoneNumber,
                    age: updatedUser.age,
                    dateOfBirth: updatedUser.dateOfBirth,
                    gender: updatedUser.gender,
                    address: updatedUser.address,
                    emergencyContact: updatedUser.emergencyContact,
                    role: updatedUser.role,
                    isActive: updatedUser.isActive,
                    isDeleted: updatedUser.isDeleted,
                    isOnline: updatedUser.isOnline,
                    lastLogin: updatedUser.lastLogin,
                    height: updatedUser.height,
                    weight: updatedUser.weight,
                    bmi: updatedUser.bmi,
                    dailyStepGoal: updatedUser.dailyStepGoal,
                    profileImage: updatedUser.profileImage || '',
                    token: generateToken(updatedUser._id),
                }
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user by ID
// @route   PUT /api/auth/profile/:id
// @access  Private
export const updateUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.age = req.body.age || user.age;
            user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
            user.gender = req.body.gender || user.gender;

            if (req.body.address) {
                user.address = { ...user.address, ...req.body.address };
            }
            if (req.body.emergencyContact) {
                user.emergencyContact = req.body.emergencyContact;
            }

            user.height = req.body.height || user.height;
            user.weight = req.body.weight || user.weight;
            user.dailyStepGoal = req.body.dailyStepGoal || user.dailyStepGoal;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phoneNumber: updatedUser.phoneNumber,
                    age: updatedUser.age,
                    dateOfBirth: updatedUser.dateOfBirth,
                    gender: updatedUser.gender,
                    address: updatedUser.address,
                    emergencyContact: updatedUser.emergencyContact,
                    role: updatedUser.role,
                    isActive: updatedUser.isActive,
                    isDeleted: updatedUser.isDeleted,
                    isOnline: updatedUser.isOnline,
                    lastLogin: updatedUser.lastLogin,
                    height: updatedUser.height,
                    weight: updatedUser.weight,
                    bmi: updatedUser.bmi,
                    dailyStepGoal: updatedUser.dailyStepGoal
                }
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            await user.deleteOne();
            res.json({ success: true, message: 'User removed' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all user profiles
// @route   GET /api/auth/profiles
// @access  Private
export const getAllProfiles = async (req, res, next) => {
    try {
        const users = await User.find({ isDeleted: false })
            .select('-password -__v')
            .sort({ name: 1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Upload profile image
// @route   POST /api/auth/upload
// @access  Private
export const uploadProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload an image');
        }

        // Update user profile with image URL
        const user = await User.findById(req.user._id);
        if (user) {
            user.profileImage = req.file.path;
            await user.save();

            res.status(200).json({
                success: true,
                data: req.file.path
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};
// @desc    Update FCM Token
// @route   PUT /api/auth/fcm-token
// @access  Private
export const updateFCMToken = async (req, res, next) => {
    try {
        const { fcmToken } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            user.fcmToken = fcmToken;
            await user.save();
            res.status(200).json({
                success: true,
                message: 'FCM Token updated successfully'
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};
