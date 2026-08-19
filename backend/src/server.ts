import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 MedRadar AI Backend running on port ${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/health`);
});
