const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const FormData = require('form-data');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'skilltempus_secret_key_2026';
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

console.log('ML_SERVICE_URL:', ML_SERVICE_URL);

const allowedOrigins = [
  'http://localhost:4200',
  'https://skill-delay-project.vercel.app',
  'https://skilltempus.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// ================================================
// BASIC ROUTES
// ================================================

app.get('/', (req, res) => {
  res.json({
    message: 'SkillTempus API is running!',
    version: '1.0.0',
    ml_service: ML_SERVICE_URL
  });
});

app.post('/api/parse-cv', async (req, res) => {
  try {
    const cvText = req.body.cv_text;
    const response = await axios.post(`${ML_SERVICE_URL}/parse-cv`, {
      cv_text: cvText
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('parse-cv error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/match-jobs', async (req, res) => {
  try {
    const { cv_text, github_username, user_id } = req.body;
    const response = await axios.post(`${ML_SERVICE_URL}/match-jobs`, {
      cv_text,
      github_username,
      user_id: user_id || ''
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('match-jobs error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/github-signal', async (req, res) => {
  try {
    const { github_username } = req.body;
    const response = await axios.post(`${ML_SERVICE_URL}/github-signal`, {
      github_username
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('github-signal error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/evaluate', async (req, res) => {
  try {
    const { cv_text, github_username } = req.body;
    const response = await axios.post(`${ML_SERVICE_URL}/evaluate`, {
      cv_text,
      github_username
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('evaluate error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================
// FILE UPLOAD ROUTE
// ================================================

app.post('/api/upload-cv-file', upload.single('file'), async (req, res) => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    form.append('github_username', req.body.github_username || '');
    form.append('user_id', req.body.user_id || '');

    const response = await axios.post(
      `${ML_SERVICE_URL}/upload-cv-file`,
      form,
      { headers: form.getHeaders() }
    );

    fs.unlinkSync(req.file.path);
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('upload-cv-file error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================
// AUTH ROUTES
// ================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }

    const response = await axios.post(
      `${ML_SERVICE_URL}/auth/register`,
      { name, email, password }
    );

    if (response.data.error) {
      return res.status(400).json({
        success: false,
        error: response.data.error
      });
    }

    const token = jwt.sign(
      { userId: response.data.user_id, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: response.data.user_id,
        name,
        email
      }
    });
  } catch (error) {
    console.error('register error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    console.log('Login attempt for:', email);
    console.log('Calling ML service at:', `${ML_SERVICE_URL}/auth/login`);

    const response = await axios.post(
      `${ML_SERVICE_URL}/auth/login`,
      { email, password }
    );

    if (response.data.error) {
      return res.status(401).json({
        success: false,
        error: response.data.error
      });
    }

    const token = jwt.sign(
      { userId: response.data.user_id, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: response.data.user_id,
        name: response.data.name,
        email
      }
    });
  } catch (error) {
    console.error('login error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      user: {
        id: decoded.userId,
        email: decoded.email
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

app.get('/api/user/history', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not logged in'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const response = await axios.get(
      `${ML_SERVICE_URL}/user/history/${userId}`
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('history error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`SkillTempus backend running on port ${PORT}`);
  console.log(`ML Service URL: ${ML_SERVICE_URL}`);
});