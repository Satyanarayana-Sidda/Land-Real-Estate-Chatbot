const asyncHandler = require('express-async-handler');
const Property = require('../models/Property');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { handleRuleBasedAnalytics } = require('../services/aiService');

// @desc    Process chat message and return recommendations
// @route   POST /api/ai
// @access  Private
const chatWithAI = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    const lowerMsg = message.toLowerCase().trim();
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'greetings', 'yo'];
    
    // Quick handle for greetings
    if (greetings.includes(lowerMsg) || (lowerMsg.length < 10 && greetings.some(g => lowerMsg.startsWith(g)))) {
        return res.json({
            response: "Greetings! I am EstateGPT. 🏦 I can help you analyze property investments, find specific land plots, or provide insights into real estate trends. How can I assist your investment strategy today?",
            properties: []
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isGeminiAvailable = apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE" && apiKey.length > 10;

    if (isGeminiAvailable) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const propertyContext = await Property.find({ status: 'available' })
                .select('title price location city state size size_unit land_type description')
                .sort({ createdAt: -1 })
                .limit(20);

            const contextString = propertyContext.map((p, i) =>
                `${i + 1}. ${p.title} (${p.land_type}) in ${p.location}, ${p.city}. Price: ${p.price}. Size: ${p.size} ${p.size_unit}. Desc: ${p.description.substring(0, 50)}...`
            ).join('\n');

            const prompt = `
                You are EstateGPT, a sophisticated AI Real Estate Investment Analyst.
                
                USER QUERY: "${message}"
                
                CONTEXT (Live Property Listings):
                ${contextString}
                
                GOAL: Provide professional, data-driven real estate advice and property recommendations.
                
                CORE DIRECTIVES:
                1. BRANDING: Always identify as EstateGPT. Maintain a professional, expert, and helpful tone.
                2. ANALYSIS: When recommending properties, briefly mention why they are good investments (e.g., location value, size-to-price ratio).
                3. ACCURACY: Use ONLY the provided context for specific property details. Do not hallucinate properties.
                4. ADVICE: If the user asks general questions, provide high-level professional advice on land acquisition, legal checks, and market trends.
                5. FORMATTING: Use clear structure with bullet points if listing multiple insights.
                
                RESPONSE STRUCTURE (JSON):
                {
                    "response": "Your expert analysis and response here",
                    "matching_property_indices": [1, 4] 
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(jsonStr);

            let suggestedProperties = [];
            if (parsedData.matching_property_indices && parsedData.matching_property_indices.length > 0) {
                suggestedProperties = parsedData.matching_property_indices
                    .map(idx => propertyContext[idx - 1])
                    .filter(Boolean);
            }

            return res.json({
                response: parsedData.response,
                properties: suggestedProperties
            });

        } catch (error) {
            console.error("Gemini AI Error, falling back to service logic:", error);
            const fallback = await handleRuleBasedAnalytics(message);
            return res.json(fallback);
        }
    } else {
        const fallback = await handleRuleBasedAnalytics(message);
        return res.json(fallback);
    }
});

module.exports = { chatWithAI };

