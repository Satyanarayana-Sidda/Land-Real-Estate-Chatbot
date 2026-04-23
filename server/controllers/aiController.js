const asyncHandler = require('express-async-handler');
const Property = require('../models/Property');

// @desc    Process chat message and return recommendations
// @route   POST /api/ai
// @access  Private
const { GoogleGenerativeAI } = require("@google/generative-ai");

// @desc    Process chat message and return recommendations
// @route   POST /api/ai
// @access  Private
const chatWithAI = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    // 1. RULE-BASED GREETING INTENT (Performance Optimization)
    // Handle simple greetings locally to save API calls and reduce latency
    const lowerMsg = message.toLowerCase().trim();
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'greetings', 'yo'];
    if (greetings.includes(lowerMsg) || (lowerMsg.length < 10 && greetings.some(g => lowerMsg.startsWith(g)))) {
        return res.json({
            response: "Greetings! I am EstateGPT. 🏦 I can help you analyze property investments, find specific land plots, or provide insights into real estate trends. How can I assist your investment strategy today?",
            properties: []
        });
    }

    // 2. CHECK FOR GEMINI API KEY
    const apiKey = process.env.GEMINI_API_KEY;
    const isGeminiAvailable = apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE" && apiKey.length > 10;

    let aiResponse = "";
    let suggestedProperties = [];

    if (isGeminiAvailable) {
        try {
            console.log("Using Gemini AI for query:", message);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            // Fetch a context of available properties to feed into the AI
            // In a production app, you would use a vector database for RAG (Retrieval Augmented Generation)
            // For now, we'll feed the top 20 most recent available properties as context
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
                    "matching_property_indices": [1, 4] // Indices of properties from the context that best match the user's intent.
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up Markdown code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(jsonStr);

            aiResponse = parsedData.response;

            if (parsedData.matching_property_indices && parsedData.matching_property_indices.length > 0) {
                // Map back to the property objects
                suggestedProperties = parsedData.matching_property_indices
                    .map(idx => propertyContext[idx - 1])
                    .filter(Boolean); // Remove nulls if index invalid
            }

        } catch (error) {
            console.error("Gemini AI Error:", error);
            // Fallback to rule-based if AI fails
            console.log("Falling back to rule-based logic...");
            return handleRuleBasedFallback(message, res);
        }
    } else {
        console.log("Gemini API key missing or invalid. Using rule-based logic.");
        return handleRuleBasedFallback(message, res);
    }

    res.json({
        response: aiResponse,
        properties: suggestedProperties
    });
});

// Helper function for rule-based logic (The original/improved logic)
const handleRuleBasedFallback = async (message, res) => {
    const lowerMsg = message.toLowerCase();
    let query = { status: 'available' };
    let responseText = "Here are some properties that might interest you:";
    let searchPerformed = false;

    // A. Improved Price Parsing using Regex
    // A. Improved Price Parsing using Regex (Supports k, m, lakh, cr and above/below)
    const priceMatch = lowerMsg.match(/(under|below|max|budget|above|over|min|minimum)\s?(?:rs\.?|₹)?\s?(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|m|lakh|lakhs|lac|lacs|cr|crore|crores)?/i);
    if (priceMatch) {
        const operator = priceMatch[1].toLowerCase();
        let priceStr = priceMatch[2].replace(/,/g, '');
        let price = parseFloat(priceStr);
        const unit = priceMatch[3] ? priceMatch[3].toLowerCase() : '';

        if (unit === 'k') price *= 1000;
        else if (unit === 'm') price *= 1000000;
        else if (unit.includes('lakh') || unit.includes('lac')) price *= 100000;
        else if (unit.includes('cr') || unit.includes('crore')) price *= 10000000;

        if (['above', 'over', 'min', 'minimum'].includes(operator)) {
            query.price = { $gte: price };
            responseText = `Found properties above ₹${price.toLocaleString()}:`;
        } else {
            query.price = { $lte: price };
            responseText = `Found properties under ₹${price.toLocaleString()}:`;
        }
        searchPerformed = true;
    }

    // B. Location Parsing
    // Simple heuristic: check against common city names if present in DB (simulated here with regex)
    // In a real app, you'd extract entities more robustly.
    const stopWords = ['in', 'at', 'near', 'around'];
    const words = lowerMsg.split(' ');
    const locationIndex = words.findIndex(w => stopWords.includes(w));

    if (locationIndex !== -1 && words[locationIndex + 1]) {
        const potentialLocation = words[locationIndex + 1].replace(/[^a-zA-Z]/g, '');
        if (potentialLocation.length > 2) {
            query.$or = [
                { location: { $regex: potentialLocation, $options: 'i' } },
                { city: { $regex: potentialLocation, $options: 'i' } },
                { state: { $regex: potentialLocation, $options: 'i' } }
            ];
            responseText = searchPerformed ? `${responseText} in ${potentialLocation}` : `Properties in ${potentialLocation}:`;
            searchPerformed = true;
        }
    }

    // C. Keyword Search
    if (!searchPerformed) {
        const keywords = lowerMsg.split(' ')
            .filter(w => !['show', 'me', 'find', 'list', 'i', 'want', 'looking', 'for', 'a', 'the', 'land', 'property'].includes(w));

        if (keywords.length > 0) {
            const keyword = keywords[0]; // Take the first meaningful word
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { land_type: { $regex: keyword, $options: 'i' } }
            ];
            responseText = `Results for "${keyword}":`;
        }
    }

    // Execute Query
    let properties = await Property.find(query).sort({ createdAt: -1 }).limit(5);

    if (properties.length === 0) {
        // If specific search failed, return latest properties
        properties = await Property.find({ status: 'available' }).sort({ createdAt: -1 }).limit(5);
        responseText = "I couldn't find exact matches for that criteria, but check out these latest listings:";
    }

    // General Advice handling
    if (!searchPerformed && (lowerMsg.includes('advice') || lowerMsg.includes('invest'))) {
        responseText = "EstateGPT Insight: Real estate wealth is built on 'Location, Liquidity, and Legality'. Always ensure a clear title deed and check for upcoming infrastructure projects in the area (Zoning verification is critical).";
    }

    res.json({
        response: responseText,
        properties
    });
};

module.exports = { chatWithAI };
