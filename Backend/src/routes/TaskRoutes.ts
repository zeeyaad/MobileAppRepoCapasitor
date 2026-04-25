import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';

const router = Router();

// GET all tasks
router.get('/', (req, res) => TaskController.getAllTasks(req, res));

// POST create task
router.post('/', (req, res) => TaskController.createTask(req, res));

// PATCH update task status
router.patch('/:id/status', (req, res) => TaskController.updateTaskStatus(req, res));

export default router;
