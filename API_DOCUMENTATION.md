# Sales Management System API Documentation

## Overview
This is a comprehensive RESTful API for the Sales Management System, designed to support both web applications and mobile sales person apps.

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

### For Sales Persons (Mobile App)
Use API Key authentication by including one of these headers:
```
X-API-Key: your_api_key_here
Authorization: Bearer your_api_key_here
```

### For Web Application
Use JWT token authentication:
```
Authorization: Bearer your_jwt_token_here
```

## API Keys for Sales Persons

### Default API Keys (for testing)
```
Alice Johnson: sp_live_alice_123456789
Bob Smith: sp_live_bob_987654321
Charlie Brown: sp_live_charlie_456789123
```

### Login Credentials for Sales Persons
```
Email: alice.johnson@company.com
Password: password123

Email: bob.smith@company.com  
Password: password123

Email: charlie.brown@company.com
Password: password123
```

## Endpoints

### Authentication

#### POST /api/auth/salesperson/login
Login for sales persons to get API key.

**Request Body:**
```json
{
  "email": "alice.johnson@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice.johnson@company.com",
    "phone": "+1-555-0201",
    "region": "Downtown",
    "status": "active"
  },
  "api_key": "sp_live_alice_123456789",
  "message": "Login successful"
}
```

#### POST /api/auth/salesperson/generate-key
Generate a new API key.

**Request Body:**
```json
{
  "email": "alice.johnson@company.com",
  "password": "password123",
  "key_name": "My Mobile App"
}
```

### Sales Person Endpoints

#### GET /api/salesperson/profile
Get sales person profile information.

**Headers:**
```
X-API-Key: sp_live_alice_123456789
```

**Response:**
```json
{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice.johnson@company.com",
  "phone": "+1-555-0201",
  "region": "Downtown",
  "current_location": "Tech District",
  "total_sales": 374850.00,
  "deals_count": 12,
  "admin_name": "John Smith",
  "admin_email": "john.smith@company.com"
}
```

#### PUT /api/salesperson/profile
Update sales person profile.

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "phone": "+1-555-0201",
  "current_location": "Downtown Mall"
}
```

#### GET /api/salesperson/customers
Get assigned customers with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (active, inactive, potential)
- `search` (optional): Search by name, company, or email

**Response:**
```json
{
  "customers": [
    {
      "id": 1,
      "name": "John Doe",
      "company": "TechCorp Solutions",
      "email": "john.doe@techcorp.com",
      "phone": "+1-555-0301",
      "address": "123 Tech Street, San Francisco, CA",
      "status": "active",
      "total_orders": 15,
      "total_spent": 25000.00,
      "order_count": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET /api/salesperson/customers/:id
Get detailed customer information including order history.

**Response:**
```json
{
  "customer": {
    "id": 1,
    "name": "John Doe",
    "company": "TechCorp Solutions",
    "email": "john.doe@techcorp.com",
    "phone": "+1-555-0301",
    "address": "123 Tech Street, San Francisco, CA",
    "status": "active",
    "total_orders": 15,
    "total_spent": 25000.00
  },
  "orders": [
    {
      "id": 1,
      "order_number": "ORD-1640995200-1",
      "total_amount": 2500.00,
      "status": "delivered",
      "order_date": "2024-01-15T10:30:00Z",
      "items": "Chilli Powder (2), Ginger Powder (1)"
    }
  ]
}
```

#### PUT /api/salesperson/customers/:id
Update customer information.

**Request Body:**
```json
{
  "name": "John Doe",
  "company": "TechCorp Solutions",
  "email": "john.doe@techcorp.com",
  "phone": "+1-555-0301",
  "address": "123 Tech Street, San Francisco, CA",
  "status": "active"
}
```

#### GET /api/salesperson/products
Get products catalog.

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search by name or description
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Chilli Powder",
      "category": "spices",
      "description": "Premium quality red chilli powder",
      "unit_price": 99.99,
      "current_stock": 150,
      "status": "in_stock"
    }
  ],
  "categories": ["spices", "herbs", "grains", "oils"]
}
```

#### POST /api/salesperson/orders
Create a new order.

**Request Body:**
```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ],
  "notes": "Customer requested express delivery",
  "delivery_date": "2024-01-20T10:00:00Z"
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 123,
    "order_number": "ORD-1640995200-1",
    "total_amount": 249.97,
    "status": "pending"
  }
}
```

#### GET /api/salesperson/orders
Get orders with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `customer_id` (optional): Filter by customer

#### GET /api/salesperson/orders/:id
Get detailed order information.

#### PATCH /api/salesperson/orders/:id/status
Update order status.

**Request Body:**
```json
{
  "status": "confirmed"
}
```

Valid statuses: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

#### GET /api/salesperson/stats
Get sales statistics.

**Query Parameters:**
- `period` (optional): week, month, quarter, year (default: month)

**Response:**
```json
{
  "period": "month",
  "stats": {
    "total_orders": 25,
    "total_revenue": 125000.00,
    "avg_order_value": 5000.00,
    "unique_customers": 15
  },
  "top_products": [
    {
      "name": "Chilli Powder",
      "category": "spices",
      "total_sold": 50,
      "total_revenue": 4999.50
    }
  ],
  "monthly_trend": [
    {
      "month": "2024-01",
      "orders": 25,
      "revenue": 125000.00
    }
  ]
}
```

#### GET /api/salesperson/activity
Get activity log with pagination.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human readable error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (invalid/missing API key)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per 15 minutes per IP address
- Additional limits may apply to specific endpoints

## Sample Integration Code

### JavaScript/Node.js
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'sp_live_alice_123456789';

// Get customers
async function getCustomers() {
  const response = await fetch(`${API_BASE_URL}/salesperson/customers`, {
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// Create order
async function createOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/salesperson/orders`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
  
  return await response.json();
}
```

### Python
```python
import requests

API_BASE_URL = 'http://localhost:3001/api'
API_KEY = 'sp_live_alice_123456789'

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# Get customers
response = requests.get(f'{API_BASE_URL}/salesperson/customers', headers=headers)
customers = response.json()

# Create order
order_data = {
    'customer_id': 1,
    'items': [
        {'product_id': 1, 'quantity': 2}
    ]
}

response = requests.post(f'{API_BASE_URL}/salesperson/orders', 
                        json=order_data, headers=headers)
order = response.json()
```

## Support

For API support and questions, contact the development team or refer to the main application documentation.