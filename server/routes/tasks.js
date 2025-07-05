import express from 'express';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';
import { io } from '../index.js';

const router = express.Router();

// Get all tasks (with filtering and pagination)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      assignedTo, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // Role-based filtering
    if (req.user.role === 'sales_person') {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === 'sales_admin') {
      filter.assignedBy = req.user.id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo && req.user.role === 'sales_admin') filter.assignedTo = assignedTo;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email phone')
      .populate('assignedBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email phone currentLocation')
      .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'sales_person' && task.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create new task (Sales Admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'sales_admin') {
      return res.status(403).json({ error: 'Only sales admins can create tasks' });
    }

    const taskData = {
      ...req.body,
      assignedBy: req.user.id
    };

    const task = new Task(taskData);
    await task.save();

    // Populate the task for response
    await task.populate('assignedTo', 'name email phone');
    await task.populate('assignedBy', 'name email');

    // Create notification for assigned sales person
    const notification = new Notification({
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${task.title}`,
      type: 'task_assigned',
      recipient: task.assignedTo._id,
      recipientModel: 'SalesPerson',
      sender: req.user.id,
      senderModel: 'SalesAdmin',
      data: {
        taskId: task._id,
        priority: task.priority,
        dueDate: task.dueDate
      }
    });

    await notification.save();

    // Send real-time notification
    io.to(`user_${task.assignedTo._id}`).emit('notification', {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      timestamp: notification.createdAt,
      read: false,
      data: notification.data
    });

    // Send task assignment event
    io.to(`user_${task.assignedTo._id}`).emit('task_assigned', {
      task: task.toObject(),
      assignedBy: {
        name: req.user.name,
        email: req.user.email
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    const canEdit = req.user.role === 'sales_admin' && task.assignedBy.toString() === req.user.id ||
                   req.user.role === 'sales_person' && task.assignedTo.toString() === req.user.id;

    if (!canEdit) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Track status changes
    const oldStatus = task.status;
    const newStatus = req.body.status;

    Object.assign(task, req.body);

    if (newStatus === 'completed' && oldStatus !== 'completed') {
      task.completedAt = new Date();
    }

    await task.save();
    await task.populate('assignedTo', 'name email phone');
    await task.populate('assignedBy', 'name email');

    // Send notification on status change
    if (oldStatus !== newStatus) {
      const recipientId = req.user.role === 'sales_person' ? task.assignedBy : task.assignedTo._id;
      const recipientModel = req.user.role === 'sales_person' ? 'SalesAdmin' : 'SalesPerson';

      const notification = new Notification({
        title: 'Task Status Updated',
        message: `Task "${task.title}" status changed from ${oldStatus} to ${newStatus}`,
        type: 'task_updated',
        recipient: recipientId,
        recipientModel,
        sender: req.user.id,
        senderModel: req.user.role === 'sales_person' ? 'SalesPerson' : 'SalesAdmin',
        data: {
          taskId: task._id,
          oldStatus,
          newStatus
        }
      });

      await notification.save();

      // Send real-time notification
      io.to(`user_${recipientId}`).emit('notification', {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: notification.createdAt,
        read: false,
        data: notification.data
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task (Sales Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'sales_admin') {
      return res.status(403).json({ error: 'Only sales admins can delete tasks' });
    }

    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Notify assigned sales person
    const notification = new Notification({
      title: 'Task Deleted',
      message: `Task "${task.title}" has been deleted`,
      type: 'info',
      recipient: task.assignedTo,
      recipientModel: 'SalesPerson',
      sender: req.user.id,
      senderModel: 'SalesAdmin',
      data: { taskId: task._id }
    });

    await notification.save();

    io.to(`user_${task.assignedTo}`).emit('notification', {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      timestamp: notification.createdAt,
      read: false
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get task statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const filter = {};
    
    if (req.user.role === 'sales_person') {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === 'sales_admin') {
      filter.assignedBy = req.user.id;
    }

    const stats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          overdue: { 
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'completed'] }
                  ]
                }, 
                1, 
                0
              ] 
            } 
          },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } }
        }
      }
    ]);

    res.json(stats[0] || {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      highPriority: 0,
      urgent: 0
    });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ error: 'Failed to fetch task statistics' });
  }
});

export default router;