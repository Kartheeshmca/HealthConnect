import Todo from '../models/Todo.js';

// @desc    Create a new todo
// @route   POST /api/todo/create
// @access  Private
export const createTodo = async (req, res, next) => {
    try {
        const { title, notes, date, isReminder, reminderTime, isDaily } = req.body;

        const todo = await Todo.create({
            userId: req.user._id,
            title,
            notes,
            date,
            isReminder,
            reminderTime,
            isDaily
        });

        res.status(201).json({
            success: true,
            data: todo
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get todos for a user
// @route   GET /api/todo/:userId
// @access  Private
export const getTodos = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to view these todos');
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const todos = await Todo.find({
            userId,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: 1 }).limit(50).lean();

        res.json({
            success: true,
            count: todos.length,
            data: todos
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a todo
// @route   PUT /api/todo/update/:id
// @access  Private
export const updateTodo = async (req, res, next) => {
    try {
        let todo = await Todo.findById(req.params.id);

        if (!todo) {
            res.status(404);
            throw new Error('Todo not found');
        }

        if (todo.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to update this todo');
        }

        todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: todo
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a todo
// @route   DELETE /api/todo/delete/:id
// @access  Private
export const deleteTodo = async (req, res, next) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            res.status(404);
            throw new Error('Todo not found');
        }

        if (todo.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to delete this todo');
        }

        await todo.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle todo completion status
// @route   PATCH /api/todo/complete/:id
// @access  Private
export const toggleCompleteTodo = async (req, res, next) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            res.status(404);
            throw new Error('Todo not found');
        }

        if (todo.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to update this todo');
        }

        todo.completed = !todo.completed;
        if (todo.completed) {
            todo.completedAt = new Date();
        } else {
            todo.completedAt = null;
        }
        const updatedTodo = await todo.save();

        res.json({
            success: true,
            data: updatedTodo
        });
    } catch (error) {
        next(error);
    }
};
