// server.js - Your Secure Backend

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

// 1. Setup
const app = express();
const PORT = 3000; 

// --- SECURITY CHECK ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set in the .env file.");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
// --- END SECURITY CHECK ---

// 2. Middleware (Handles incoming requests)
app.use(cors()); 
// Allows the server to accept large JSON bodies (needed for the image data)
app.use(express.json({ limit: '5mb' })); 

// 3. The API Endpoint for AI Analysis
app.post('/api/ai-instructions', async (req, res) => {
    try {
        const { base64Image, mimeType } = req.body; 

        if (!base64Image || !mimeType) {
            return res.status(400).send({ error: 'Missing image data or mime type.' });
        }

        // The prompt tells the AI exactly what to do
        const prompt = "Analyze this image of an accident or incident. Provide three direct, simple, and immediate safety instructions for the person at the scene. Be concise, use action verbs, and focus only on immediate safety action.";

        // Format the image for the Gemini API
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType
            }
        };

        // Call the Gemini API with the image and prompt
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [imagePart, { text: prompt }],
        });
        
        // 4. Send the AI's instructions back to your app
        res.json({ instructions: response.text });

    } catch (error) {
        console.error('Gemini API Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to generate instructions from AI. See server logs for details.'
        });
    }
});

// 5. Start the server
app.listen(PORT, () => {
    console.log(`\n✅ Gemini Backend Server running at http://localhost:${PORT}`);
    console.log(`   (Keep this window open while testing)\n`);
});