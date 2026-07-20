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
const PORT = 3000;
const JWT_SECRET = 'skilltempus_secret_key_2026';

// Middleware

app.use(cors({
    origin: ['https://your-vercel-url.vercel.app', 'http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// File upload setup
const upload = multer({ dest: 'uploads/' });

// ================================================
// BASIC ROUTES
// ================================================

app.get('/', (req, res) => {
    res.json({
        message: 'SkillTempus API is running!',
        version: '1.0.0'
    });
});

app.post('/api/parse-cv', async (req, res) => {
    try {
        const cvText = req.body.cv_text;
        const response = await axios.post('http://localhost:8000/parse-cv', {
            cv_text: cvText
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/match-jobs', async (req, res) => {
    try {
        const { cv_text, github_username, user_id } = req.body;
        
        const response = await axios.post('http://localhost:8000/match-jobs', {
            cv_text,
            github_username,
            user_id: user_id || ''
        });
        
        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/github-signal', async (req, res) => {
    try {
        const { github_username } = req.body;
        const response = await axios.post('http://localhost:8000/github-signal', {
            github_username
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/evaluate', async (req, res) => {
    try {
        const { cv_text, github_username } = req.body;
        const response = await axios.post('http://localhost:8000/evaluate', {
            cv_text,
            github_username
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ================================================
// FILE UPLOAD ROUTE
// ================================================

app.post('/api/upload-cv-file', upload.single('file'), async (req, res) => {
    try {
        const FormData = require('form-data');
        const fs = require('fs');

        const form = new FormData();
        form.append('file', fs.createReadStream(req.file.path), {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });
        form.append('github_username', req.body.github_username || '');
        form.append('user_id', req.body.user_id || '');  // ← add this

        const response = await axios.post(
            'http://localhost:8000/upload-cv-file',
            form,
            { headers: form.getHeaders() }
        );

        fs.unlinkSync(req.file.path);

        res.json({ success: true, data: response.data });
    } catch (error) {
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
            'http://localhost:8000/auth/register',
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

        const response = await axios.post(
            'http://localhost:8000/auth/login',
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
            `http://localhost:8000/user/history/${userId}`
        );

        res.json({ 
            success: true, 
            data: response.data 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`SkillTempus backend running on http://localhost:${PORT}`);
});