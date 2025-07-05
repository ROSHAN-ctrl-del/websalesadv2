import express from 'express';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, read } = req.query;
    
    const filter = { recipient: req.user.id };
    if (read !== undefined) {
      filter.read = read === 'true';
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      read: false 
    });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Create system notification (admin only)
router.post('/system', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin' && req.user.role !== 'sales_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, message, type, recipients, recipientModel } = req.body;

    const notifications = recipients.map(recipientId => ({
      title,
      message,
      type: type || 'info',
      recipient: recipientId,
      recipientModel: recipientModel || 'SalesPerson',
      sender: req.user.id,
      senderModel: req.user.role === 'sales_admin' ? 'SalesAdmin' : 'SalesAdmin'
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    res.status(201).json({
      message: 'Notifications sent successfully',
      count: createdNotifications.length
    });
  } catch (error) {
    console.error('Error creating system notifications:', error);
    res.status(500).json({ error: 'Failed to create notifications' });
  }
});

export default router;