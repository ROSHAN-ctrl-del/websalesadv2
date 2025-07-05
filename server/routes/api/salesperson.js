import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../../config/database.js';
import { authenticateApiKey, requirePermission } from '../../middleware/apiAuth.js';
import { logActivity } from '../../utils/activityLogger.js';

const router = express.Router();

// Get sales person profile
router.get('/profile', authenticateApiKey, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sp.id, sp.name, sp.email, sp.phone, sp.region, sp.current_location, 
              sp.total_sales, sp.deals_count, sp.last_activity, sp.created_at,
              sa.name as admin_name, sa.email as admin_email
       FROM sales_persons sp 
       LEFT JOIN sales_admins sa ON sp.sales_admin_id = sa.id 
       WHERE sp.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sales person not found' });
    }

    await logActivity(req.user.id, 'sales_person', 'profile_viewed', 'Viewed profile information', req);
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update sales person profile
router.put('/profile', authenticateApiKey, async (req, res) => {
  try {
    const { name, phone, current_location } = req.body;
    
    await pool.query(
      'UPDATE sales_persons SET name = ?, phone = ?, current_location = ?, updated_at = NOW() WHERE id = ?',
      [name, phone, current_location, req.user.id]
    );

    await logActivity(req.user.id, 'sales_person', 'profile_updated', 'Updated profile information', req);
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get assigned customers
router.get('/customers', authenticateApiKey, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT c.*, COUNT(so.id) as order_count
      FROM customers c 
      LEFT JOIN sales_orders so ON c.id = so.customer_id
      WHERE c.assigned_to = ?
    `;
    const params = [req.user.id];
    
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (c.name LIKE ? OR c.company LIKE ? OR c.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' GROUP BY c.id ORDER BY c.updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [customers] = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM customers WHERE assigned_to = ?';
    const countParams = [req.user.id];
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (search) {
      countQuery += ' AND (name LIKE ? OR company LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    
    await logActivity(req.user.id, 'sales_person', 'customers_viewed', `Viewed customers list (page ${page})`, req);
    
    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer details
router.get('/customers/:id', authenticateApiKey, async (req, res) => {
  try {
    const [customers] = await pool.query(
      'SELECT * FROM customers WHERE id = ? AND assigned_to = ?',
      [req.params.id, req.user.id]
    );
    
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Customer not found or not assigned to you' });
    }
    
    // Get customer's order history
    const [orders] = await pool.query(
      `SELECT so.*, 
              GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') as items
       FROM sales_orders so
       LEFT JOIN order_items oi ON so.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE so.customer_id = ?
       GROUP BY so.id
       ORDER BY so.created_at DESC`,
      [req.params.id]
    );
    
    await logActivity(req.user.id, 'sales_person', 'customer_viewed', `Viewed customer details: ${customers[0].name}`, req);
    
    res.json({
      customer: customers[0],
      orders
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
});

// Update customer
router.put('/customers/:id', authenticateApiKey, async (req, res) => {
  try {
    const { name, company, email, phone, address, status } = req.body;
    
    // Check if customer is assigned to this sales person
    const [existing] = await pool.query(
      'SELECT id FROM customers WHERE id = ? AND assigned_to = ?',
      [req.params.id, req.user.id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Customer not found or not assigned to you' });
    }
    
    await pool.query(
      'UPDATE customers SET name = ?, company = ?, email = ?, phone = ?, address = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [name, company, email, phone, address, status, req.params.id]
    );
    
    await logActivity(req.user.id, 'sales_person', 'customer_updated', `Updated customer: ${name}`, req);
    
    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Get products catalog
router.get('/products', authenticateApiKey, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM products WHERE current_stock > 0';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [products] = await pool.query(query, params);
    
    // Get categories
    const [categories] = await pool.query(
      'SELECT DISTINCT category FROM products WHERE current_stock > 0 ORDER BY category'
    );
    
    await logActivity(req.user.id, 'sales_person', 'products_viewed', 'Viewed products catalog', req);
    
    res.json({
      products,
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create new order
router.post('/orders', authenticateApiKey, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { customer_id, items, notes, delivery_date } = req.body;
    
    // Verify customer is assigned to this sales person
    const [customerCheck] = await connection.query(
      'SELECT id FROM customers WHERE id = ? AND assigned_to = ?',
      [customer_id, req.user.id]
    );
    
    if (customerCheck.length === 0) {
      throw new Error('Customer not found or not assigned to you');
    }
    
    // Calculate total amount and validate products
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const [product] = await connection.query(
        'SELECT id, name, unit_price, current_stock FROM products WHERE id = ?',
        [item.product_id]
      );
      
      if (product.length === 0) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      
      if (product[0].current_stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product[0].name}. Available: ${product[0].current_stock}, Requested: ${item.quantity}`);
      }
      
      const itemTotal = product[0].unit_price * item.quantity;
      totalAmount += itemTotal;
      
      validatedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product[0].unit_price,
        total_price: itemTotal
      });
    }
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${req.user.id}`;
    
    // Create order
    const [orderResult] = await connection.query(
      'INSERT INTO sales_orders (order_number, customer_id, sales_person_id, total_amount, notes, delivery_date) VALUES (?, ?, ?, ?, ?, ?)',
      [orderNumber, customer_id, req.user.id, totalAmount, notes, delivery_date]
    );
    
    const orderId = orderResult.insertId;
    
    // Create order items and update stock
    for (const item of validatedItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.unit_price, item.total_price]
      );
      
      // Update product stock
      await connection.query(
        'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Update sales person stats
    await connection.query(
      'UPDATE sales_persons SET total_sales = total_sales + ?, deals_count = deals_count + 1, last_activity = NOW() WHERE id = ?',
      [totalAmount, req.user.id]
    );
    
    // Update customer stats
    await connection.query(
      'UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ?, last_order = NOW() WHERE id = ?',
      [totalAmount, customer_id]
    );
    
    await connection.commit();
    
    await logActivity(req.user.id, 'sales_person', 'order_created', `Created order ${orderNumber} for ₹${totalAmount}`, req);
    
    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount,
        status: 'pending'
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(400).json({ error: error.message || 'Failed to create order' });
  } finally {
    connection.release();
  }
});

// Get orders
router.get('/orders', authenticateApiKey, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customer_id } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT so.*, c.name as customer_name, c.company as customer_company
      FROM sales_orders so
      JOIN customers c ON so.customer_id = c.id
      WHERE so.sales_person_id = ?
    `;
    const params = [req.user.id];
    
    if (status) {
      query += ' AND so.status = ?';
      params.push(status);
    }
    
    if (customer_id) {
      query += ' AND so.customer_id = ?';
      params.push(customer_id);
    }
    
    query += ' ORDER BY so.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [orders] = await pool.query(query, params);
    
    await logActivity(req.user.id, 'sales_person', 'orders_viewed', `Viewed orders list (page ${page})`, req);
    
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order details
router.get('/orders/:id', authenticateApiKey, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT so.*, c.name as customer_name, c.company as customer_company, c.email as customer_email, c.phone as customer_phone
       FROM sales_orders so
       JOIN customers c ON so.customer_id = c.id
       WHERE so.id = ? AND so.sales_person_id = ?`,
      [req.params.id, req.user.id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const [items] = await pool.query(
      `SELECT oi.*, p.name as product_name, p.category
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    
    await logActivity(req.user.id, 'sales_person', 'order_viewed', `Viewed order details: ${orders[0].order_number}`, req);
    
    res.json({
      order: orders[0],
      items
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Update order status
router.patch('/orders/:id/status', authenticateApiKey, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const [result] = await pool.query(
      'UPDATE sales_orders SET status = ?, updated_at = NOW() WHERE id = ? AND sales_person_id = ?',
      [status, req.params.id, req.user.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    await logActivity(req.user.id, 'sales_person', 'order_status_updated', `Updated order status to ${status}`, req);
    
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get sales statistics
router.get('/stats', authenticateApiKey, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case 'week':
        dateFilter = 'AND so.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        break;
      case 'month':
        dateFilter = 'AND so.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        break;
      case 'quarter':
        dateFilter = 'AND so.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
        break;
      case 'year':
        dateFilter = 'AND so.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        break;
    }
    
    // Get sales stats
    const [salesStats] = await pool.query(
      `SELECT 
         COUNT(*) as total_orders,
         SUM(total_amount) as total_revenue,
         AVG(total_amount) as avg_order_value,
         COUNT(DISTINCT customer_id) as unique_customers
       FROM sales_orders so
       WHERE so.sales_person_id = ? ${dateFilter}`,
      [req.user.id]
    );
    
    // Get top products
    const [topProducts] = await pool.query(
      `SELECT p.name, p.category, SUM(oi.quantity) as total_sold, SUM(oi.total_price) as total_revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN sales_orders so ON oi.order_id = so.id
       WHERE so.sales_person_id = ? ${dateFilter}
       GROUP BY p.id
       ORDER BY total_revenue DESC
       LIMIT 5`,
      [req.user.id]
    );
    
    // Get monthly trend
    const [monthlyTrend] = await pool.query(
      `SELECT 
         DATE_FORMAT(created_at, '%Y-%m') as month,
         COUNT(*) as orders,
         SUM(total_amount) as revenue
       FROM sales_orders
       WHERE sales_person_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month`,
      [req.user.id]
    );
    
    await logActivity(req.user.id, 'sales_person', 'stats_viewed', `Viewed sales statistics (${period})`, req);
    
    res.json({
      period,
      stats: salesStats[0],
      top_products: topProducts,
      monthly_trend: monthlyTrend
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get activity log
router.get('/activity', authenticateApiKey, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const [activities] = await pool.query(
      'SELECT * FROM activity_logs WHERE user_id = ? AND user_type = "sales_person" ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.user.id, parseInt(limit), parseInt(offset)]
    );
    
    res.json({ activities });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

export default router;