import Joi from 'joi';

const authValidators = {
    register: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string().required(),
        password: Joi.string().min(6).required(),
        age: Joi.number().min(0).optional(),
        dateOfBirth: Joi.date().iso().optional(),
        gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
        address: Joi.object({
            city: Joi.string().optional(),
            state: Joi.string().optional(),
        }).optional(),
        emergencyContact: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                phoneNumber: Joi.string().required(),
                relation: Joi.string().optional(),
            })
        ).optional(),
        height: Joi.number().optional(),
        weight: Joi.number().optional(),
        role: Joi.string().valid('user', 'admin').optional(),
    }),
    login: Joi.object({
        email: Joi.string().email().optional(),
        phoneNumber: Joi.string().optional(),
        password: Joi.string().required(),
    }).or('email', 'phoneNumber')
};

const familyValidators = {
    create: Joi.object({
        name: Joi.string().required(),
    }),
    addMember: Joi.object({
        email: Joi.string().email().optional(),
        phoneNumber: Joi.string().optional(),
        familyId: Joi.string().required(),
    }).or('email', 'phoneNumber')
};

const healthValidators = {
    add: Joi.object({
        steps: Joi.number().optional(),
        weight: Joi.number().optional(),
        bloodPressure: Joi.object({
            systolic: Joi.number().required(),
            diastolic: Joi.number().required()
        }).optional(),
        sugarLevel: Joi.number().optional(),
        sleepHours: Joi.number().optional(),
        waterIntake: Joi.number().optional(),
        date: Joi.date().iso().optional()
    })
};

const reminderValidators = {
    create: Joi.object({
        title: Joi.string().required(),
        type: Joi.string().valid('Medicine', 'Appointment', 'Exercise', 'Hydration', 'Other').required(),
        time: Joi.date().iso().required(),
        repeat: Joi.string().valid('None', 'Daily', 'Weekly', 'Monthly').optional(),
        isAlarm: Joi.boolean().optional(),
        alarmSound: Joi.string().optional(),
    }),
    update: Joi.object({
        title: Joi.string().optional(),
        type: Joi.string().valid('Medicine', 'Appointment', 'Exercise', 'Hydration', 'Other').optional(),
        time: Joi.date().iso().optional(),
        repeat: Joi.string().valid('None', 'Daily', 'Weekly', 'Monthly').optional(),
        isAlarm: Joi.boolean().optional(),
        alarmSound: Joi.string().optional(),
    })
};

export const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({ success: false, message: errorMessages });
    }
    next();
};

export {
    authValidators,
    familyValidators,
    healthValidators,
    reminderValidators
};
