import express from 'express';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration (important for cross-origin requests)
app.use(cors({ origin: 'https://manarthaaiassistancejaikaran.netlify.app' })); // Replace with your actual Netlify URL
// Body parsing middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => {
        console.error('MongoDB Connection Error:', err);
    });

// Mongoose Model
const formEntrySchema = new mongoose.Schema({
    role: String,
    company: String,
    years: String,
    skills: String,
    achievements: String,
    timestamp: { type: Date, default: Date.now },
});

const FormEntry = mongoose.model('FormEntry', formEntrySchema);

// Gemini API Integration
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Generate Suggestions Endpoint
app.post('/generate', async (req, res) => {
    const { prompt } = req.body;
    console.log("Received prompt:", prompt);
    try {
        console.log('Gemini API call started');
        const result = await model.generateContent(prompt);
        console.log('Gemini API call finished');
        console.log('Gemini API result', result);
        let suggestion = result.response.text().trim();
        suggestion = suggestion.replace(/\*\*/g, '');
        suggestion = suggestion.replace(/  +/g, ' '); // Corrected regex for multiple spaces
        console.log("Generated suggestion:", suggestion);
        const formattedSuggestions = suggestion.split('\n').filter(s => s.trim() !== '').map(s => s.trim()) || [];
        res.json({ suggestion: formattedSuggestions });
    } catch (error) {
        console.error('Error generating suggestion:', error);
        res.status(500).json({ error: 'Failed to generate suggestion' });
    }
});

// Save Form Data Endpoint
app.post('/generate', async (req, res) => {
    const { prompt } = req.body;
    try {
        const result = await model.generateContent(prompt);
        let suggestion = result.response.text().trim();
        suggestion = suggestion.replace(/\*\*/g, '');
        suggestion = suggestion.replace(/  +/g, ' ');
        const suggestionsArray = suggestion.split('\n').filter(s => s.trim() !== '').map(s => s.trim());
        const suggestionsObject = {
            role: suggestionsArray,
            company: suggestionsArray,
            years: suggestionsArray,
            skills: suggestionsArray,
            achievements: suggestionsArray,
        };
        res.json({ suggestions: suggestionsObject });
    } catch (error) {
        console.error('Error generating suggestion:', error);
        res.status(500).json({ error: 'Failed to generate suggestion' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
