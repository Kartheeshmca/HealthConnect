import Family from '../models/Family.js';
import User from '../models/User.js';

// @desc    Create a new family group
// @route   POST /api/family/create
// @access  Private
export const createFamily = async (req, res, next) => {
    try {
        const { name } = req.body;

        // Generate a unique family ID (simplistic approach for demo)
        const familyId = `FAM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const newFamily = await Family.create({
            familyId,
            name,
            createdBy: req.user._id,
            members: [{ user: req.user._id }]
        });

        res.status(201).json({
            success: true,
            data: newFamily
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add member to family
// @route   POST /api/family/add-member
// @access  Private
export const addMember = async (req, res, next) => {
    try {
        const { email, phoneNumber, familyId } = req.body;

        const family = await Family.findOne({ familyId });
        if (!family) {
            res.status(404);
            throw new Error('Family not found');
        }

        // Only creator can add members (or adjust logic as needed)
        if (family.createdBy.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('User not authorized to add members to this family');
        }

        // Search for user by email or phoneNumber
        const query = {};
        if (email) query.email = email;
        else if (phoneNumber) query.phoneNumber = phoneNumber;
        else {
            res.status(400);
            throw new Error('Please provide an email or phoneNumber');
        }

        const userToAdd = await User.findOne(query);
        if (!userToAdd) {
            res.status(404);
            throw new Error('User to add not found');
        }

        // Check if user is already a member
        const isMember = family.members.find(member => member.user.toString() === userToAdd._id.toString());
        if (isMember) {
            res.status(400);
            throw new Error('User is already a member of this family');
        }

        family.members.push({ user: userToAdd._id });
        await family.save();

        res.json({
            success: true,
            data: family
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get family by ID
// @route   GET /api/family/:familyId
// @access  Private
export const getFamily = async (req, res, next) => {
    try {
        const family = await Family.findOne({ familyId: req.params.familyId }).populate('members.user', 'name email age role phoneNumber profileImage');

        if (!family) {
            res.status(404);
            throw new Error('Family not found');
        }

        // Ensure the requester is a member
        const isMember = family.members.find(member => member.user._id.toString() === req.user._id.toString());
        if (!isMember && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to view this family');
        }

        res.json({
            success: true,
            data: family
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a family group
// @route   PUT /api/family/:familyId
// @access  Private
export const updateFamily = async (req, res, next) => {
    try {
        let family = await Family.findOne({ familyId: req.params.familyId });

        if (!family) {
            res.status(404);
            throw new Error('Family not found');
        }

        if (family.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to update this family');
        }

        family = await Family.findOneAndUpdate({ familyId: req.params.familyId }, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: family });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a family group
// @route   DELETE /api/family/:familyId
// @access  Private
export const deleteFamily = async (req, res, next) => {
    try {
        const family = await Family.findOne({ familyId: req.params.familyId });

        if (!family) {
            res.status(404);
            throw new Error('Family not found');
        }

        if (family.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to delete this family');
        }

        await family.deleteOne();

        res.json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove member from family
// @route   POST /api/family/remove-member
// @access  Private
export const removeMember = async (req, res, next) => {
    try {
        const { email, familyId } = req.body;

        const family = await Family.findOne({ familyId });
        if (!family) {
            res.status(404);
            throw new Error('Family not found');
        }

        if (family.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to remove members from this family');
        }

        const userToRemove = await User.findOne({ email });
        if (!userToRemove) {
            res.status(404);
            throw new Error('User to remove not found');
        }

        family.members = family.members.filter(member => member.user.toString() !== userToRemove._id.toString());
        await family.save();

        res.json({ success: true, data: family });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all families
// @route   GET /api/family
// @access  Public
export const getAllFamilies = async (req, res, next) => {
    try {
        const families = await Family.find({}).populate('members.user', 'name email role phoneNumber profileImage');

        res.json({
            success: true,
            count: families.length,
            data: families
        });
    } catch (error) {
        next(error);
    }
};


