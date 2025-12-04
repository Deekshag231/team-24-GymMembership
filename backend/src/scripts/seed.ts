import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import User from '../models/User';
import Membership from '../models/Membership';
import Workout from '../models/Workout';
import Progress from '../models/Progress';
import Session from '../models/Session';
import Booking from '../models/Booking';
import WorkoutPlan from '../models/WorkoutPlan';
import CheckIn from '../models/CheckIn';
import Staff from '../models/Staff';
import Payment from '../models/Payment';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Membership.deleteMany({});
    await Workout.deleteMany({});
    await Progress.deleteMany({});
    await Session.deleteMany({});
    await Booking.deleteMany({});
    await WorkoutPlan.deleteMany({});
    await CheckIn.deleteMany({});
    await Staff.deleteMany({});
    await Payment.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@fittrack.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 555-0001',
    });

    // Create Trainers
    const trainer1 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah.j@fittrack.com',
      password: 'trainer123',
      role: 'trainer',
      phone: '+1 555-0201',
    });

    const trainer2 = await User.create({
      name: 'Mike Chen',
      email: 'mike.c@fittrack.com',
      password: 'trainer123',
      role: 'trainer',
      phone: '+1 555-0202',
    });

    const trainer3 = await User.create({
      name: 'Emma Wilson',
      email: 'emma.w@fittrack.com',
      password: 'trainer123',
      role: 'trainer',
      phone: '+1 555-0203',
    });

    // Create Staff records
    await Staff.create({
      user: trainer1._id,
      role: 'Senior Trainer',
      specialization: ['Yoga', 'Flexibility', 'Meditation'],
      rating: 4.9,
      activeClients: 15,
      joinDate: new Date('2023-01-15'),
    });

    await Staff.create({
      user: trainer2._id,
      role: 'Personal Trainer',
      specialization: ['Strength Training', 'HIIT', 'Nutrition'],
      rating: 4.8,
      activeClients: 12,
      joinDate: new Date('2023-06-20'),
    });

    await Staff.create({
      user: trainer3._id,
      role: 'Personal Trainer',
      specialization: ['Cardio', 'Weight Loss', 'Boxing'],
      rating: 4.7,
      activeClients: 10,
      joinDate: new Date('2023-09-10'),
    });

    // Create Members
    const member1 = await User.create({
      name: 'Alex Morgan',
      email: 'alex.morgan@email.com',
      password: 'member123',
      role: 'member',
      phone: '+1 555-0101',
    });

    const member2 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      password: 'member123',
      role: 'member',
      phone: '+1 555-0102',
    });

    const member3 = await User.create({
      name: 'Michael Chen',
      email: 'mchen@email.com',
      password: 'member123',
      role: 'member',
      phone: '+1 555-0103',
    });

    // Create Memberships
    await Membership.create({
      member: member1._id,
      planType: 'Premium Annual',
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-01-01'),
      price: 1200,
    });

    await Membership.create({
      member: member2._id,
      planType: 'Monthly Basic',
      status: 'active',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-12-15'),
      price: 99,
    });

    await Membership.create({
      member: member3._id,
      planType: 'Quarterly Premium',
      status: 'frozen',
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-12-10'),
      price: 285,
    });

    // Create Workouts
    const workout1 = await Workout.create({
      member: member1._id,
      date: new Date(),
      exercises: [
        { name: 'Bench Press', sets: 3, reps: 10, weight: 80 },
        { name: 'Squats', sets: 4, reps: 8, weight: 100 },
      ],
      duration: 45,
      caloriesBurned: 350,
    });

    // Create Progress entries
    await Progress.create({
      member: member1._id,
      date: new Date('2024-01-01'),
      weight: 85,
      bodyFat: 24,
      muscle: 38,
      chest: 102,
      waist: 88,
      arms: 38,
    });

    await Progress.create({
      member: member1._id,
      date: new Date(),
      weight: 77,
      bodyFat: 18,
      muscle: 42,
      chest: 107,
      waist: 78,
      arms: 42,
    });

    // Create Sessions
    const session1 = await Session.create({
      type: 'Yoga Class',
      trainer: trainer1._id,
      date: new Date('2024-12-05'),
      time: '6:00 PM',
      duration: 60,
      maxSpots: 15,
      bookedSpots: 8,
      status: 'scheduled',
    });

    const session2 = await Session.create({
      type: 'HIIT Training',
      trainer: trainer2._id,
      date: new Date('2024-12-05'),
      time: '7:00 AM',
      duration: 45,
      maxSpots: 12,
      bookedSpots: 5,
      status: 'scheduled',
    });

    // Create Bookings
    await Booking.create({
      member: member1._id,
      session: session1._id,
      status: 'confirmed',
    });

    // Create Workout Plans
    await WorkoutPlan.create({
      name: 'Full Body Strength',
      description: 'Comprehensive full-body workout focusing on compound movements',
      duration: '8 weeks',
      difficulty: 'Intermediate',
      category: 'strength',
      exercises: [
        { name: 'Bench Press', sets: 3, reps: 10, weight: 80 },
        { name: 'Squats', sets: 4, reps: 8, weight: 100 },
        { name: 'Deadlift', sets: 3, reps: 6, weight: 120 },
      ],
      createdBy: trainer2._id,
      assignedTo: [member1._id],
    });

    // Create Check-ins
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      await CheckIn.create({
        member: member1._id,
        location: 'FitTrack Downtown',
        checkInTime: date,
      });
    }

    // Create Payments
    await Payment.create({
      member: member1._id,
      amount: 1200,
      type: 'membership',
      status: 'completed',
      paymentDate: new Date('2024-01-01'),
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@fittrack.com / admin123');
    console.log('Trainer: sarah.j@fittrack.com / trainer123');
    console.log('Member: alex.morgan@email.com / member123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

