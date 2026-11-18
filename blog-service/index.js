const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/blog';
mongoose.connect(MONGO_URI);

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true }
});
const Post = mongoose.model('Post', postSchema);

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// JWT auth middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Public: list all posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: get single post
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    // Invalid ObjectId format
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Protected: create post
app.post('/posts', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const post = new Post({ title, content, author: req.user.username });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: update post (only author)
app.put('/posts/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author !== req.user.username) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    await post.save();
    res.json(post);
  } catch (err) {
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Protected: delete post (only author)
app.delete('/posts/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author !== req.user.username) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    if (err.kind === 'ObjectId' || err.name === 'CastError') {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Blog service running on port ${PORT}`));
