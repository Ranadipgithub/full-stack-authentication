import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
];

app.use(express.json());
app.use(cors({origin: allowedOrigins,credentials:true}));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Api Working');
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));