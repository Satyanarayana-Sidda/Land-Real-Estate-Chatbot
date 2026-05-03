const { Property } = require('../models');
const { Op } = require('sequelize');

/**
 * Handles rule-based chatbot responses as a fallback or for performance.
 * @param {string} message - User message
 * @returns {Promise<{response: string, properties: Array}>}
 */
const handleRuleBasedAnalytics = async (message) => {
    const lowerMsg = message.toLowerCase().trim();
    let whereClause = { status: 'available' };
    let responseText = "Based on market data, here are some relevant property listings:";
    let searchPerformed = false;

    // A. Price Range Decomposition
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
            whereClause.price = { [Op.gte]: price };
            responseText = `EstateGPT Analytics: Identified properties valuation above ₹${price.toLocaleString()}. Check these options:`;
        } else {
            whereClause.price = { [Op.lte]: price };
            responseText = `EstateGPT Analytics: Identified high-value properties under ₹${price.toLocaleString()}. Recommended for your budget:`;
        }
        searchPerformed = true;
    }

    // B. Geospatial/Location Filtering
    const stopWords = ['in', 'at', 'near', 'around', 'of'];
    const words = lowerMsg.split(' ');
    const locationIndex = words.findIndex(w => stopWords.includes(w));

    if (locationIndex !== -1 && words[locationIndex + 1]) {
        const potentialLocation = words[locationIndex + 1].replace(/[^a-zA-Z]/g, '');
        if (potentialLocation.length > 2) {
            whereClause[Op.or] = [
                { location: { [Op.like]: `%${potentialLocation}%` } },
                { city: { [Op.like]: `%${potentialLocation}%` } }
            ];
            responseText = searchPerformed ? `${responseText} in ${potentialLocation}` : `EstateGPT Location Report: Curated land listings in ${potentialLocation}:`;
            searchPerformed = true;
        }
    }

    // C. Semantic Keyword Matching
    if (!searchPerformed) {
        const ignoreKeywords = ['show', 'me', 'find', 'list', 'i', 'want', 'looking', 'for', 'a', 'the', 'land', 'property', 'plots'];
        const keywords = lowerMsg.split(' ').filter(w => !ignoreKeywords.includes(w));

        if (keywords.length > 0) {
            const keyword = keywords[0]; 
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${keyword}%` } },
                { description: { [Op.like]: `%${keyword}%` } },
                { land_type: { [Op.like]: `%${keyword}%` } }
            ];
            responseText = `EstateGPT Insight: Keyword search results for "${keyword}":`;
        }
    }

    // Database Lookup
    let properties = await Property.findAll({ 
        where: whereClause, 
        order: [['createdAt', 'DESC']], 
        limit: 5 
    });

    // Fallback Result if no matches
    if (properties.length === 0) {
        properties = await Property.findAll({ 
            where: { status: 'available' }, 
            order: [['createdAt', 'DESC']], 
            limit: 5 
        });
        responseText = "EstateGPT Note: No exact matches found for high-precision query. Broadening search to top-tier available listings:";
    }

    return { response: responseText, properties };
};

module.exports = {
    handleRuleBasedAnalytics
};
