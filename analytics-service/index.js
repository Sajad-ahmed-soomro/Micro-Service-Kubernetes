const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/analytics';
mongoose.connect(MONGO_URI);

const logSchema = new mongoose.Schema({
  log: Object,
  timestamp: Date
});
const Log = mongoose.model('Log', logSchema);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/log', async (req, res) => {
  try {
    const log = new Log({ log: req.body, timestamp: new Date() });
    await log.save();
    res.status(201).json({ message: 'Log stored' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Analytics service running on port ${PORT}`));
