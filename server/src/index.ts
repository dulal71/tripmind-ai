import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect Database
  await connectDB();
  
  // Start Express server
  app.listen(PORT, () => {
    console.log(`[Server] TripMind AI API Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();
