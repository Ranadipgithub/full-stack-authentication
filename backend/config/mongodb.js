import mongoose from 'mongoose';

const connectDB = async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}/auth`);
    console.log('Connected to MongoDB');
}

export default connectDB;