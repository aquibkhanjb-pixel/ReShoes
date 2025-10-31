# ReShoe API Documentation

Complete API reference for all endpoints in the ReShoe platform.

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer" // or "seller"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### Login
Authenticate existing user.

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### Get Current User
Get authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## Shoe Endpoints

### Get All Shoes
Fetch shoes with optional filters.

**Endpoint:** `GET /api/shoes`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `category` (string): Filter by category (men, women, unisex, kids)
- `brand` (string): Filter by brand
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `condition` (string): Filter by condition
- `size` (number): Filter by size
- `search` (string): Search in title, brand, description
- `sort` (string): Sort field (default: -createdAt)

**Example:** `GET /api/shoes?category=men&minPrice=50&maxPrice=100&page=1`

**Response:** `200 OK`
```json
{
  "success": true,
  "shoes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Nike Air Max 90",
      "brand": "Nike",
      "size": 10,
      "condition": "like-new",
      "price": 89.99,
      "description": "Barely worn...",
      "images": ["https://..."],
      "status": "available",
      "category": "men",
      "views": 45,
      "seller": {
        "_id": "...",
        "name": "Sarah Johnson",
        "email": "sarah@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "pages": 5
  }
}
```

---

### Create Shoe
Create a new shoe listing (Seller only).

**Endpoint:** `POST /api/shoes`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "Nike Air Max 90",
  "brand": "Nike",
  "size": 10,
  "condition": "like-new",
  "price": 89.99,
  "description": "Barely worn Nike Air Max...",
  "images": ["base64_image_string or url"],
  "category": "men"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Shoe created successfully",
  "shoe": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Nike Air Max 90",
    "brand": "Nike",
    ...
  }
}
```

---

### Get Single Shoe
Get detailed information about a specific shoe.

**Endpoint:** `GET /api/shoes/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "shoe": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Nike Air Max 90",
    "brand": "Nike",
    "size": 10,
    "condition": "like-new",
    "price": 89.99,
    "description": "Barely worn...",
    "images": ["https://..."],
    "status": "available",
    "category": "men",
    "views": 46,
    "seller": {
      "_id": "...",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "profileImage": "https://..."
    },
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "reviews": [
    {
      "_id": "...",
      "rating": 5,
      "comment": "Great shoes!",
      "user": {
        "name": "John Doe"
      }
    }
  ]
}
```

---

### Update Shoe
Update a shoe listing (Owner or Admin only).

**Endpoint:** `PUT /api/shoes/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "price": 79.99,
  "status": "available"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Shoe updated successfully",
  "shoe": { ... }
}
```

---

### Delete Shoe
Delete a shoe listing (Owner or Admin only).

**Endpoint:** `DELETE /api/shoes/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Shoe deleted successfully"
}
```

---

## Order Endpoints

### Get Orders
Get orders for the authenticated user.

**Endpoint:** `GET /api/orders`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

**Response:** `200 OK`
```json
{
  "success": true,
  "orders": [
    {
      "_id": "...",
      "buyer": { "name": "John Doe" },
      "seller": { "name": "Sarah Johnson" },
      "shoe": {
        "title": "Nike Air Max 90",
        "images": ["..."],
        "price": 89.99
      },
      "amount": 89.99,
      "status": "pending",
      "shippingAddress": {
        "fullName": "John Doe",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA",
        "phone": "555-0123"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

### Create Order
Create a new order after successful payment.

**Endpoint:** `POST /api/orders`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "shoeId": "507f1f77bcf86cd799439011",
  "paymentId": "pi_1234567890",
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "555-0123"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": { ... }
}
```

---

### Get Single Order
Get details of a specific order.

**Endpoint:** `GET /api/orders/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### Update Order Status
Update order status (Seller or Admin only).

**Endpoint:** `PUT /api/orders/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "status": "shipped" // pending, processing, shipped, delivered, cancelled
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": { ... }
}
```

---

## Transaction Endpoints

### Get Transactions
Get transaction history (Seller or Admin only).

**Endpoint:** `GET /api/transactions`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `payoutStatus` (string): Filter by payout status

**Response:** `200 OK`
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "...",
      "seller": { "name": "Sarah Johnson" },
      "order": { ... },
      "amount": 89.99,
      "commission": 8.99,
      "commissionRate": 10,
      "sellerEarnings": 81.00,
      "payoutStatus": "pending",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { ... },
  "totals": {
    "totalAmount": 450.00,
    "totalCommission": 45.00,
    "totalSellerEarnings": 405.00
  }
}
```

---

## Review Endpoints

### Create Review
Create a review for a delivered order.

**Endpoint:** `POST /api/reviews`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "shoeId": "507f1f77bcf86cd799439011",
  "orderId": "507f1f77bcf86cd799439012",
  "rating": 5,
  "comment": "Excellent shoes, exactly as described!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Review created successfully",
  "review": {
    "_id": "...",
    "rating": 5,
    "comment": "Excellent shoes...",
    "user": {
      "name": "John Doe",
      "profileImage": "..."
    },
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## Stripe Endpoints

### Create Payment Intent
Create a Stripe payment intent for checkout.

**Endpoint:** `POST /api/stripe/create-payment-intent`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "shoeId": "507f1f77bcf86cd799439011"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "clientSecret": "pi_1234567890_secret_abcdef",
  "amount": 89.99
}
```

---

## Admin Endpoints

### Get Analytics
Get platform analytics (Admin only).

**Endpoint:** `GET /api/admin/analytics`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "analytics": {
    "users": {
      "total": 50,
      "customers": 30,
      "sellers": 19
    },
    "shoes": {
      "total": 100,
      "available": 75,
      "sold": 25
    },
    "orders": {
      "total": 25,
      "pending": 5,
      "delivered": 18
    },
    "financial": {
      "totalRevenue": 2500.00,
      "totalCommission": 250.00,
      "totalSellerEarnings": 2250.00,
      "pendingPayouts": 450.00
    },
    "recentOrders": [ ... ],
    "topSellers": [ ... ],
    "salesOverTime": [ ... ]
  }
}
```

---

### Get Settings
Get platform settings (Admin only).

**Endpoint:** `GET /api/admin/settings`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "settings": {
    "_id": "...",
    "commissionRate": 10,
    "platformName": "ReShoe",
    "contactEmail": "support@reshoe.com"
  }
}
```

---

### Update Settings
Update platform settings (Admin only).

**Endpoint:** `PUT /api/admin/settings`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "commissionRate": 12,
  "platformName": "ReShoe",
  "contactEmail": "support@reshoe.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": { ... }
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [ ... ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized - Please login"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden - Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:
- Rate limiting middleware
- Request throttling
- IP-based restrictions

---

## Testing with cURL

### Example: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Example: Get Shoes
```bash
curl http://localhost:3000/api/shoes?category=men&limit=5
```

### Example: Create Shoe (with auth)
```bash
curl -X POST http://localhost:3000/api/shoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Test Shoe","brand":"Nike","size":10,"condition":"good","price":50,"description":"Test","images":["url"],"category":"men"}'
```

---

## Postman Collection

A Postman collection is available in the `postman/` directory for easy API testing.

---

For additional help, refer to the main README.md or open an issue on GitHub.
