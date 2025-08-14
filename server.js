// filepath: c:\wander-voice\server.js
import express from 'express';
import bodyParser from 'body-parser';
import handler from './api/generate-trip-plan.ts';

const app = express();
app.use(bodyParser.json());

app.post('/api/generate-trip-plan', handler);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});