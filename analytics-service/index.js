// analytics-service/index.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/analytics', { useNewUrlParser: true, useUnifiedTopology: true });

const logSchema = new mongoose.Schema({
  log: Object,
  timestamp: Date
});
const Log = mongoose.model('Log', logSchema);

app.post('/log', async (req, res) => {
  const log = new Log({ log: req.body, timestamp: new Date() });
  await log.save();
  res.status(201).json({ message: 'Log stored' });
});

app.get('/logs', async (req, res) => {
  const logs = await Log.find();
  res.json(logs);
});

const PORT = 3002;
app.listen(PORT, () => console.log(`Analytics service running on port ${PORT}`));
