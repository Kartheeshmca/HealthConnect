import express from 'express';
import { createTodo, getTodos, updateTodo, deleteTodo, toggleCompleteTodo } from '../controllers/todoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createTodo);
router.get('/:userId', protect, getTodos);
router.put('/update/:id', protect, updateTodo);
router.patch('/complete/:id', protect, toggleCompleteTodo);
router.delete('/delete/:id', protect, deleteTodo);

export default router;
