# GymF API Documentation

Complete API documentation for the GymF gym management system.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "fail",
  "message": "Error message"
}
```

---

## Authentication Endpoints

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "member"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "jwt-token",
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member"
    }
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### Get Current User
```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

---

## Member Endpoints (Admin Only)

### Get All Members
```http
GET /members?status=active&search=john
```

**Query Parameters:**
- `status` (optional): Filter by membership status (active, expired, frozen, all)
- `search` (optional): Search by name or email

### Get Member by ID
```http
GET /members/:id
```

### Create Member
```http
POST /members
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "planType": "Premium Annual",
  "startDate": "2024-01-01",
  "endDate": "2025-01-01",
  "price": 1200
}
```

### Update Member
```http
PATCH /members/:id
```

### Delete Member
```http
DELETE /members/:id
```

---

## Workout Endpoints (Member)

### Get My Workouts
```http
GET /workouts
```

### Get Workout Stats
```http
GET /workouts/stats
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "workoutsThisWeek": 4,
      "totalWorkouts": 50,
      "totalVolume": 12500,
      "streak": 12
    }
  }
}
```

### Create Workout
```http
POST /workouts
```

**Request Body:**
```json
{
  "date": "2024-12-05",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 3,
      "reps": 10,
      "weight": 80
    }
  ],
  "duration": 45,
  "caloriesBurned": 350
}
```

### Update Workout
```http
PATCH /workouts/:id
```

### Delete Workout
```http
DELETE /workouts/:id
```

---

## Progress Endpoints (Member)

### Get My Progress
```http
GET /progress?limit=50
```

### Get Progress Stats
```http
GET /progress/stats
```

### Create Progress Entry
```http
POST /progress
```

**Request Body:**
```json
{
  "date": "2024-12-05",
  "weight": 77,
  "bodyFat": 18,
  "muscle": 42,
  "chest": 107,
  "waist": 78,
  "arms": 42
}
```

---

## Session Endpoints (Member)

### Get Available Sessions
```http
GET /sessions/available?date=2024-12-05
```

### Get My Bookings
```http
GET /sessions/my-bookings
```

### Book Session
```http
POST /sessions/book
```

**Request Body:**
```json
{
  "sessionId": "session-id"
}
```

### Cancel Booking
```http
PATCH /sessions/cancel/:id
```

---

## Check-in Endpoints (Member)

### Check In
```http
POST /checkins
```

**Request Body:**
```json
{
  "location": "FitTrack Downtown"
}
```

### Get My Check-ins
```http
GET /checkins
```

---

## Workout Plan Endpoints (Trainer/Admin)

### Get All Plans
```http
GET /plans?category=strength
```

### Create Plan
```http
POST /plans
```

**Request Body:**
```json
{
  "name": "Full Body Strength",
  "description": "Comprehensive workout",
  "duration": "8 weeks",
  "difficulty": "Intermediate",
  "category": "strength",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 3,
      "reps": 10,
      "weight": 80
    }
  ]
}
```

### Assign Plan
```http
POST /plans/:id/assign
```

**Request Body:**
```json
{
  "memberId": "member-id"
}
```

---

## Staff Endpoints (Admin Only)

### Get All Staff
```http
GET /staff?filter=trainers
```

**Query Parameters:**
- `filter` (optional): all, trainers, staff

### Create Staff
```http
POST /staff
```

---

## Analytics Endpoints (Admin Only)

### Get Dashboard Stats
```http
GET /analytics/dashboard
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "activeMembers": 284,
      "expiringThisMonth": 23,
      "todayRevenue": 4850,
      "todayCheckIns": 127
    }
  }
}
```

### Get Revenue Analytics
```http
GET /analytics/revenue?months=6
```

---

## Member Home Endpoint

### Get Member Home Data
```http
GET /member-home
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "membership": {
      "plan": "Premium Annual",
      "startDate": "2024-01-01",
      "endDate": "2025-01-01",
      "daysRemaining": 28,
      "status": "active"
    },
    "todayStats": {
      "streak": 12,
      "workoutsThisWeek": 4,
      "caloriesBurned": 350,
      "minutesExercised": 65
    },
    "upcomingSessions": [...]
  }
}
```

---

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting for production.

---

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD)
- All timestamps are in UTC
- Pagination is not implemented but can be added
- File uploads are not currently supported

