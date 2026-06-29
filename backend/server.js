const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// File upload setup
const upload = multer({ dest: 'uploads/' });

// ================================================
// ROUTES
// ================================================

// Test route - check server is running
app.get('/', (req, res) => {
    res.json({ 
        message: 'Skill Decay API is running!',
        version: '1.0.0'
    });
});

// Route 1 - Parse CV and get skill profile
app.post('/api/parse-cv', upload.single('cv'), async (req, res) => {
    try {
        const cvText = req.body.cv_text;
        
        // Call Python ML service
        const response = await axios.post('http://localhost:8000/parse-cv', {
            cv_text: cvText
        });
        
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

// Route 2 - Get job matches
app.post('/api/match-jobs', async (req, res) => {
    try {
        const { cv_text, github_username } = req.body;
        
        // Call Python ML service
        const response = await axios.post('http://localhost:8000/match-jobs', {
            cv_text,
            github_username
        });
        
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

// Route 3 - Get GitHub signals
app.post('/api/github-signal', async (req, res) => {
    try {
        const { github_username } = req.body;
        
        // Call Python ML service
        const response = await axios.post('http://localhost:8000/github-signal', {
            github_username
        });
        
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

// Route 4 - Run full evaluation
app.post('/api/evaluate', async (req, res) => {
    try {
        const { cv_text, github_username } = req.body;
        
        // Call Python ML service
        const response = await axios.post('http://localhost:8000/evaluate', {
            cv_text,
            github_username
        });
        
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
    console.log(`Backend server running on http://localhost:${PORT}`);
});