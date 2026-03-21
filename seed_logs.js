import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HealthLog from './src/models/HealthLog.js';
import User from './src/models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found in database, skipping seeding.');
      process.exit();
    }

    let totalSeeded = 0;
    for (const user of users) {
      const userId = user._id;

      // Remove existing logs for this user to have a clean 7 days
      await HealthLog.deleteMany({ userId });

      const logs = [];
      const now = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        logs.push({
          userId,
          steps: 4000 + Math.floor(Math.random() * 8000),
          weight: user.weight || 70 + Math.floor(Math.random() * 10),
          bloodPressure: {
            systolic: 110 + Math.floor(Math.random() * 30),
            diastolic: 70 + Math.floor(Math.random() * 20),
          },
          sugarLevel: 100 + Math.floor(Math.random() * 100),
          sleepHours: 6 + Math.floor(Math.random() * 3),
          waterIntake: 1500 + Math.floor(Math.random() * 1500),
          mealsLogged: 3,
          date: date
        });
      }

      await HealthLog.insertMany(logs);
      totalSeeded += 7;
      console.log(`Seeded 7 days of logs for user: ${user.name}`);
    }

    console.log(`Seeded total ${totalSeeded} health logs successfully!`);
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
