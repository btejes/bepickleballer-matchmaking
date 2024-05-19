// library/connectToDatabase.js
import mongoose from 'mongoose';

const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return mongoose.connection.asPromise();

  return mongoose.connect(process.env.MONGODB_URI);
};

export default connectToDatabase;
