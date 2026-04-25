import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Task, TaskStatus } from '../entities/Task';

export class TaskController {
    private static taskRepo = AppDataSource.getRepository(Task);

    static async getAllTasks(req: Request, res: Response) {
        try {
            const tasks = await TaskController.taskRepo.find({
                order: { created_at: 'DESC' },
            });
            return res.json({ success: true, data: tasks });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
        }
    }

    static async createTask(req: Request, res: Response) {
        try {
            const { title, description, type, data, created_by } = req.body;

            const newTask = TaskController.taskRepo.create({
                title,
                description,
                type,
                data,
                created_by,
                status: TaskStatus.PENDING,
            });

            await TaskController.taskRepo.save(newTask);

            return res.status(201).json({ success: true, message: 'Task created successfully', data: newTask });
        } catch (error) {
            console.error('Error creating task:', error);
            return res.status(500).json({ success: false, message: 'Failed to create task' });
        }
    }

    static async updateTaskStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!Object.values(TaskStatus).includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const task = await TaskController.taskRepo.findOne({ where: { id: parseInt(id) } });

            if (!task) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }

            task.status = status;
            await TaskController.taskRepo.save(task);

            return res.json({ success: true, message: `Task ${status} successfully`, data: task });
        } catch (error) {
            console.error('Error updating task:', error);
            return res.status(500).json({ success: false, message: 'Failed to update task' });
        }
    }
}
