# Database Schema Documentation

Complete database schema documentation for GymF.

## Overview

The database uses MongoDB with Mongoose ODM. All models include automatic `createdAt` and `updatedAt` timestamps.

---

## Models

### User

Represents all users in the system (members, admins, trainers).

```typescript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  phone: String (optional),
  role: String (enum: 'member' | 'admin' | 'trainer', default: 'member'),
  avatar: String (optional),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)

**Relationships:**
- One-to-many with Membership
- One-to-many with Workout
- One-to-many with Progress
- One-to-many with Booking
- One-to-one with Staff (for trainers/admins)

---

### Membership

Represents member subscription plans.

```typescript
{
  _id: ObjectId,
  member: ObjectId (ref: 'User', required),
  planType: String (required, enum: 'Monthly Basic' | 'Monthly Premium' | 'Quarterly Premium' | 'Annual Premium' | 'Premium Annual'),
  status: String (enum: 'active' | 'expired' | 'frozen' | 'cancelled', default: 'active'),
  startDate: Date (required),
  endDate: Date (required),
  price: Number (required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `member` + `status`
- `endDate`

**Relationships:**
- Many-to-one with User (member)

---

### Workout

Represents workout logs with exercises.

```typescript
{
  _id: ObjectId,
  member: ObjectId (ref: 'User', required),
  date: Date (required, default: now),
  exercises: [{
    name: String (required),
    sets: Number (required, min: 1),
    reps: Number (required, min: 1),
    weight: Number (required, min: 0),
    notes: String (optional)
  }],
  duration: Number (required, minutes),
  totalVolume: Number (calculated: sum of sets * reps * weight),
  caloriesBurned: Number (optional, min: 0),
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `member` + `date` (descending)
- `date` (descending)

**Relationships:**
- Many-to-one with User (member)

**Pre-save Hook:**
- Calculates `totalVolume` automatically

---

### Progress

Represents progress tracking entries (weight, body measurements, etc.).

```typescript
{
  _id: ObjectId,
  member: ObjectId (ref: 'User', required),
  date: Date (required, default: now),
  weight: Number (optional, min: 0, kg),
  bodyFat: Number (optional, min: 0, max: 100, %),
  muscle: Number (optional, min: 0, kg),
  chest: Number (optional, min: 0, cm),
  waist: Number (optional, min: 0, cm),
  arms: Number (optional, min: 0, cm),
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `member` + `date` (descending)

**Relationships:**
- Many-to-one with User (member)

---

### Session

Represents training sessions that can be booked.

```typescript
{
  _id: ObjectId,
  type: String (required, e.g., 'Yoga Class', 'HIIT Training'),
  trainer: ObjectId (ref: 'User', required),
  date: Date (required),
  time: String (required, e.g., '6:00 PM'),
  duration: Number (required, minutes),
  maxSpots: Number (required, min: 1),
  bookedSpots: Number (default: 0, min: 0),
  status: String (enum: 'scheduled' | 'completed' | 'cancelled', default: 'scheduled'),
  bookings: [ObjectId] (ref: 'Booking'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `trainer` + `date`
- `date` + `status`

**Relationships:**
- Many-to-one with User (trainer)
- One-to-many with Booking

---

### Booking

Represents member bookings for sessions.

```typescript
{
  _id: ObjectId,
  member: ObjectId (ref: 'User', required),
  session: ObjectId (ref: 'Session', required),
  status: String (enum: 'confirmed' | 'cancelled' | 'completed', default: 'confirmed'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `member` + `status`
- `session`

**Relationships:**
- Many-to-one with User (member)
- Many-to-one with Session

---

### WorkoutPlan

Represents workout plans created by trainers.

```typescript
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  duration: String (required, e.g., '8 weeks'),
  difficulty: String (enum: 'Beginner' | 'Intermediate' | 'Advanced', required),
  category: String (enum: 'strength' | 'cardio' | 'flexibility' | 'mixed', required),
  exercises: [{
    name: String (required),
    sets: Number (required, min: 1),
    reps: Number (required, min: 1),
    weight: Number (optional, min: 0),
    notes: String (optional)
  }],
  createdBy: ObjectId (ref: 'User', required),
  assignedTo: [ObjectId] (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `createdBy`
- `category`

**Relationships:**
- Many-to-one with User (createdBy)
- Many-to-many with User (assignedTo)

---

### CheckIn

Represents member check-in records.

```typescript
{
  _id: ObjectId,
  member: ObjectId (ref: 'User', required),
  location: String (required),
  checkInTime: Date (required, default: now),
  createdAt: Date
}
```

**Indexes:**
- `member` + `checkInTime` (descending)
- `checkInTime` (descending)

**Relationships:**
- Many-to-one with User (member)

---

### Staff

Represents staff information (trainers, managers, etc.).

```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required, unique),
  role: String (required, e.g., 'Senior Trainer', 'Gym Manager'),
  specialization: [String],
  rating: Number (default: 0, min: 0, max: 5),
  activeClients: Number (default: 0, min: 0),
  joinDate: Date (required, default: now),
  availability: Map<String, String> (optional, e.g., 'Monday': '7:00 AM - 8:00 PM'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `user` (unique)

**Relationships:**
- One-to-one with User

---

### Payment

Represents payment records.

```typescript
{
  _id: ObjectId,
  member: ObjectId (ref: 'User', required),
  amount: Number (required, min: 0),
  type: String (enum: 'membership' | 'session' | 'plan', required),
  status: String (enum: 'pending' | 'completed' | 'failed' | 'refunded', default: 'pending'),
  paymentDate: Date (required, default: now),
  membership: ObjectId (ref: 'Membership', optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `member` + `paymentDate` (descending)
- `paymentDate` + `status`

**Relationships:**
- Many-to-one with User (member)
- Many-to-one with Membership (optional)

---

## Relationships Summary

```
User (1) ──< (N) Membership
User (1) ──< (N) Workout
User (1) ──< (N) Progress
User (1) ──< (N) Booking
User (1) ──< (N) CheckIn
User (1) ──< (N) Payment
User (1) ──< (1) Staff
User (1) ──< (N) WorkoutPlan (createdBy)
User (N) >──< (N) WorkoutPlan (assignedTo)
Session (1) ──< (N) Booking
```

---

## Data Types

- **ObjectId**: MongoDB ObjectId (24 character hex string)
- **Date**: ISO 8601 date string or Date object
- **String**: UTF-8 string
- **Number**: 64-bit floating point
- **Boolean**: true/false
- **Array**: Ordered list of values
- **Map**: Key-value pairs

---

## Validation Rules

- Email addresses must be valid and unique
- Passwords are hashed using bcrypt (12 rounds)
- Dates must be valid ISO 8601 format
- Numbers have min/max constraints where applicable
- Required fields cannot be null or undefined

---

## Indexes

All models have appropriate indexes for:
- Foreign key lookups
- Date range queries
- Status filtering
- Search operations

---

## Notes

- All timestamps are stored in UTC
- Soft deletes are not implemented (hard deletes)
- Cascading deletes are not automatic (handle in application logic)
- Transactions are not used (consider for critical operations)

