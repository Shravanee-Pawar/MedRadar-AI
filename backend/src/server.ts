import app from './app.js';
import { connectDB } from "./config.js";
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
app.listen(PORT, () => {
  console.log(`🚀 MedRadar AI Backend running on port ${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/health`);
});
};

startServer();
