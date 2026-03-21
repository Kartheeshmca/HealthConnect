import Reminder from '../models/Reminder.js';

// @desc    Create a new reminder
// @route   POST /api/reminder/create
// @access  Private
export const createReminder = async (req, res, next) => {
    try {
        const { title, type, time, repeat, isAlarm, alarmSound } = req.body;

        const reminder = await Reminder.create({
            userId: req.user._id,
            title,
            type,
            time,
            repeat,
            isAlarm,
            alarmSound
        });

        res.status(201).json({
            success: true,
            data: reminder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reminders for a user
// @route   GET /api/reminder/:userId
// @access  Private
export const getReminders = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to view these reminders');
        }

        const reminders = await Reminder.find({ userId }).sort({ time: 1 });

        res.json({
            success: true,
            count: reminders.length,
            data: reminders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a reminder
// @route   PUT /api/reminder/update/:id
// @access  Private
export const updateReminder = async (req, res, next) => {
    try {
        let reminder = await Reminder.findById(req.params.id);

        if (!reminder) {
            res.status(404);
            throw new Error('Reminder not found');
        }

        if (reminder.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to update this reminder');
        }

        reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: reminder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminder/delete/:id
// @access  Private
export const deleteReminder = async (req, res, next) => {
    try {
        const reminder = await Reminder.findById(req.params.id);

        if (!reminder) {
            res.status(404);
            throw new Error('Reminder not found');
        }

        if (reminder.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to delete this reminder');
        }

        await reminder.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Toggle reminder completion status
// @route   PATCH /api/reminder/complete/:id
// @access  Private
export const toggleCompleteReminder = async (req, res, next) => {
    try {
        const reminder = await Reminder.findById(req.params.id);

        if (!reminder) {
            res.status(404);
            throw new Error('Reminder not found');
        }

        if (reminder.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to update this reminder');
        }

        reminder.completed = !reminder.completed;
        const updatedReminder = await reminder.save();

        res.json({
            success: true,
            data: updatedReminder
        });
    } catch (error) {
        next(error);
    }
};
